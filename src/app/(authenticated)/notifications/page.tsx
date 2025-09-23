'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { meService } from '@/services/me';
import LoadingBrand from '@/components/LoadingBrand';
import {
  FiCheckCircle,
  FiBriefcase,
  FiClock,
  FiHeart,
  FiEye,
  FiEdit,
  FiBell,
  FiStar,
  FiUserCheck,
  FiMessageSquare,
  FiInbox,
} from 'react-icons/fi';
import styles from '@/styles/NotificationsPage.module.css';

enum NotificationType {
  job_application_received = 'job_application_received',
  job_application_updated = 'job_application_updated',
  job_published = 'job_published',
  job_expiring = 'job_expiring',
  profile_liked = 'profile_liked',
  profile_viewed = 'profile_viewed',
  review_notes_added = 'review_notes_added',
  system_announcement = 'system_announcement',
  welcome_message = 'welcome_message',
  account_verification = 'account_verification',
  custom = 'custom',
}

const notificationIcons: Record<NotificationType, React.FC<any>> = {
  [NotificationType.job_application_received]: FiBriefcase,
  [NotificationType.job_application_updated]: FiBriefcase,
  [NotificationType.job_published]: FiBriefcase,
  [NotificationType.job_expiring]: FiClock,
  [NotificationType.profile_liked]: FiHeart,
  [NotificationType.profile_viewed]: FiEye,
  [NotificationType.review_notes_added]: FiEdit,
  [NotificationType.system_announcement]: FiBell,
  [NotificationType.welcome_message]: FiStar,
  [NotificationType.account_verification]: FiUserCheck,
  [NotificationType.custom]: FiMessageSquare,
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: keyof typeof NotificationType;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
};

type NotificationsResponse = {
  notifications: { notifications: NotificationItem[] };
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

type NotificationFilter = 'unread' | 'read';

const notificationStatusLabels: Record<NotificationFilter, string> = {
  unread: 'Não lidas',
  read: 'Lidas',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'unread' | 'read'>('unread');

  const [limit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [total, setTotal] = useState(0);

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit, offset };
      const { notifications: notifData, unreadCount: countData, pagination } = await meService.getMyNotifications(params);
      setNotifications(notifData.notifications as NotificationItem[]);
      setUnreadCount(countData);
      setTotal(pagination.total);
    } catch (error) {
      console.error('Erro ao carregar notificações', error);
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  const displayedNotifications = useMemo(() => {
    return notifications.filter(notif => filter === 'read' ? notif.isRead : !notif.isRead);
  }, [notifications, filter]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const onChangeFilter = (nextFilter: 'unread' | 'read') => {
    setOffset(0);
    setFilter(nextFilter);
  };

  const onPrev = () => setOffset((o) => Math.max(0, o - limit));
  const onNext = () => {
    const next = offset + limit;
    if (next < total) setOffset(next);
  };

  const markAllAsRead = async () => {
    try {
      await meService.markAllNotificationsAsRead();
      void loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await meService.markNotificationAsRead(id);
      void loadNotifications();
    } catch (error) {
      console.error('Erro ao marcar como lida', error);
    }
  };

  return (
    <LoadingBrand loading={loading}>
      <section className={styles.page}>
        <header className={styles.header}>
          <button
            className={styles.primaryBtn}
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Marcar todas como lidas ({unreadCount})
          </button>

          <div className={styles.pager}>
            <button
              className={styles.pagerBtn}
              onClick={onPrev}
              disabled={offset === 0}
              type="button"
              aria-label="Página anterior"
            >
              ←
            </button>
            <span className={styles.pageInfo}>
              Página {page} de {totalPages}
            </span>
            <button
              className={styles.pagerBtn}
              onClick={onNext}
              disabled={offset + limit >= total}
              type="button"
              aria-label="Próxima página"
            >
              →
            </button>
          </div>
        </header>

        <div className={styles.tabs} role="tablist">
          <div className={styles.filters} role="tablist" aria-label="Filtrar por status">
            {(['unread', 'read'] as NotificationFilter[]).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={filter === s}
                className={`${styles.filterBtn} ${filter === s ? styles.filterBtn_active : ''}`}
                onClick={() => onChangeFilter(s)}
              >
                {notificationStatusLabels[s]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.notifications}>
          {displayedNotifications.length === 0 && !loading ? (
            <div className={styles.empty}>
              <FiInbox className={styles.emptyIcon} />
              <h3 className={styles.emptyTitle}>Nenhuma notificação encontrada</h3>
              <p className={styles.emptyText}>Parece que você não tem notificações nesta categoria.</p>
            </div>
          ) : (
            displayedNotifications.map((notification) => {
              const IconComponent = notificationIcons[notification.type as NotificationType];
              return (
                <div
                  key={notification.id}
                  className={`${styles.notification} ${!notification.isRead ? styles.notification_unread : ''}`}
                >
                  <div className={`${styles['notification-icon-wrapper']} ${styles[notification.type]}`}>
                    {IconComponent && <IconComponent className={styles['notification-icon']} />}
                  </div>
                  <div className={styles.notificationContent}>
                    <strong>{notification.title}</strong>
                    <p className={styles.muted}>{notification.message}</p>
                    <small>{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                  {!notification.isRead && (
                    <button
                      className={styles.readButton}
                      onClick={() => markAsRead(notification.id)}
                      title="Marcar como lida"
                    >
                      <FiCheckCircle />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
        {notifications.length > 0 && (
          <div className={styles.footerPager}>
            <button
              className={styles.pagerBtn}
              onClick={onPrev}
              disabled={offset === 0}
              type="button"
            >
              ← Anterior
            </button>
            <span className={styles.pageInfo}>Página {page} de {totalPages}</span>
            <button
              className={styles.pagerBtn}
              onClick={onNext}
              disabled={offset + limit >= total}
              type="button"
            >
              Próxima →
            </button>
          </div>
        )}
      </section>
    </LoadingBrand>
  );
}
