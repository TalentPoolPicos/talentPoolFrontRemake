'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import LoadingBrand from '@/components/LoadingBrand';
import ImageUser from '@/components/ImageUser';
import { useAuth } from '@/hooks/useAuth';
import { meService } from '@/services/me';
import { path } from '@/lib/path';

import type {
  Role,
  UserProfileResponseDto,
  UpdateStudentProfileDto,
  UpdateEnterpriseProfileDto,
  CreateAddressDto,
  UpdateAddressDirectDto,
  TagItem,
} from '@/types';

import styles from '@/styles/ProfileEdit.module.css';

type SocialMediaItem = { uuid?: string; type: string; url: string };

type SocialsForm = {
  discord: string;
  linkedin: string;
  github: string;
};

function toDateInput(iso?: string | null) {
  return iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? iso.slice(0, 10) : '';
}
function isValidISODate(d?: string) {
  if (!d) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(d);
}
function trimOrEmpty(v?: string | null) {
  return (v ?? '').trim();
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { isBootstrapped, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);

  const [savingUser, setSavingUser] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [savingSocials, setSavingSocials] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfileResponseDto | null>(null);

  const [initialBase, setInitialBase] = useState({
    name: '',
    description: '',
    birthDate: '',
  });
  const [initialStudent, setInitialStudent] = useState({
    course: '',
    registrationNumber: '',
    lattes: '',
  });
  const [initialEnterprise, setInitialEnterprise] = useState({
    fantasyName: '',
    cnpj: '',
    socialReason: '',
  });
  const [initialAddress, setInitialAddress] = useState<CreateAddressDto>({
    zipCode: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [initialSocials, setInitialSocials] = useState<SocialsForm>({
    discord: '',
    linkedin: '',
    github: '',
  });
  const [initialOtherSocials, setInitialOtherSocials] = useState<SocialMediaItem[] | undefined>(undefined);

  const [formBase, setFormBase] = useState({
    name: '',
    description: '',
    birthDate: '',
  });

  const [formStudent, setFormStudent] = useState({
    course: '',
    registrationNumber: '',
    lattes: '',
  });

  const [formEnterprise, setFormEnterprise] = useState({
    fantasyName: '',
    cnpj: '',
    socialReason: '',
  });

  const [addressForm, setAddressForm] = useState<CreateAddressDto>({
    zipCode: '',
    street: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  const [socials, setSocials] = useState<SocialsForm>({
    discord: '',
    linkedin: '',
    github: '',
  });

  const [curriculumFile, setCurriculumFile] = useState<File | null>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);

  const role = useMemo<Role>(() => (profile?.role === 'enterprise' ? 'enterprise' : 'student'), [profile?.role]);
  const hasAddress = !!profile?.address;

  const loadProfile = useCallback(async () => {
    if (!isBootstrapped) return;
    if (!isLoggedIn) {
      router.replace(path.home());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const me = await meService.getMyProfile();
      setProfile(me);

      const baseSnap = {
        name: trimOrEmpty(me.name),
        description: trimOrEmpty(me.description),
        birthDate: toDateInput(me.birthDate),
      };
      setInitialBase(baseSnap);
      setFormBase(baseSnap);

      const studentSnap = {
        course: trimOrEmpty(me.student?.course),
        registrationNumber: trimOrEmpty(me.student?.registrationNumber),
        lattes: trimOrEmpty(me.student?.lattes),
      };
      setInitialStudent(studentSnap);
      setFormStudent(studentSnap);

      const enterpriseSnap = {
        fantasyName: trimOrEmpty(me.enterprise?.fantasyName),
        cnpj: trimOrEmpty(me.enterprise?.cnpj),
        socialReason: trimOrEmpty(me.enterprise?.socialReason),
      };
      setInitialEnterprise(enterpriseSnap);
      setFormEnterprise(enterpriseSnap);

      const addrSnap: CreateAddressDto = {
        zipCode: trimOrEmpty(me.address?.zipCode),
        street: trimOrEmpty(me.address?.street),
        neighborhood: trimOrEmpty(me.address?.neighborhood),
        city: trimOrEmpty(me.address?.city),
        state: trimOrEmpty(me.address?.state),
      };
      setInitialAddress(addrSnap);
      setAddressForm(addrSnap);

      const map: SocialsForm = { discord: '', linkedin: '', github: '' };
      const others: SocialMediaItem[] = [];

      (me.socialMedia ?? []).forEach((sm) => {
        const t = sm.type as keyof SocialsForm;
        if (t in map) {
          (map as any)[t] = sm.url ?? '';
        } else {
          others.push(sm);
        }
      });

      setInitialSocials(map);
      setSocials(map);
      setInitialOtherSocials(others.length ? others : undefined);
    } catch {
      setError('Falha ao carregar o perfil.');
    } finally {
      setLoading(false);
    }
  }, [isBootstrapped, isLoggedIn, router]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onBaseChange = (k: keyof typeof formBase, v: string) =>
    setFormBase((s) => ({ ...s, [k]: v }));

  const onStudentChange = (k: keyof typeof formStudent, v: string) =>
    setFormStudent((s) => ({ ...s, [k]: v }));

  const onEnterpriseChange = (k: keyof typeof formEnterprise, v: string) =>
    setFormEnterprise((s) => ({ ...s, [k]: v }));

  const onAddressChange = (k: keyof CreateAddressDto, v: string) =>
    setAddressForm((a) => ({ ...a, [k]: v }));

  const onSocialChange = (k: keyof SocialsForm, v: string) =>
    setSocials((s) => ({ ...s, [k]: v }));

  const isProfileDirty = useMemo(() => {
    const baseDirty =
      trimOrEmpty(formBase.name) !== trimOrEmpty(initialBase.name) ||
      trimOrEmpty(formBase.description) !== trimOrEmpty(initialBase.description) ||
      trimOrEmpty(formBase.birthDate) !== trimOrEmpty(initialBase.birthDate);

    if (role === 'student') {
      return (
        baseDirty ||
        trimOrEmpty(formStudent.course) !== trimOrEmpty(initialStudent.course) ||
        trimOrEmpty(formStudent.registrationNumber) !== trimOrEmpty(initialStudent.registrationNumber) ||
        trimOrEmpty(formStudent.lattes) !== trimOrEmpty(initialStudent.lattes)
      );
    }
    return (
      baseDirty ||
      trimOrEmpty(formEnterprise.fantasyName) !== trimOrEmpty(initialEnterprise.fantasyName) ||
      trimOrEmpty(formEnterprise.cnpj) !== trimOrEmpty(initialEnterprise.cnpj) ||
      trimOrEmpty(formEnterprise.socialReason) !== trimOrEmpty(initialEnterprise.socialReason)
    );
  }, [formBase, initialBase, role, formStudent, initialStudent, formEnterprise, initialEnterprise]);

  const isAddressDirty = useMemo(() => {
    return (
      trimOrEmpty(addressForm.zipCode) !== trimOrEmpty(initialAddress.zipCode) ||
      trimOrEmpty(addressForm.street) !== trimOrEmpty(initialAddress.street) ||
      trimOrEmpty(addressForm.neighborhood) !== trimOrEmpty(initialAddress.neighborhood) ||
      trimOrEmpty(addressForm.city) !== trimOrEmpty(initialAddress.city) ||
      trimOrEmpty(addressForm.state) !== trimOrEmpty(initialAddress.state)
    );
  }, [addressForm, initialAddress]);

  const isSocialsDirty = useMemo(() => {
    return (
      trimOrEmpty(socials.discord) !== trimOrEmpty(initialSocials.discord) ||
      trimOrEmpty(socials.linkedin) !== trimOrEmpty(initialSocials.linkedin) ||
      trimOrEmpty(socials.github) !== trimOrEmpty(initialSocials.github)
    );
  }, [socials, initialSocials]);

  const profileValid = useMemo(() => {
    const nameOk = trimOrEmpty(formBase.name).length >= 2 && trimOrEmpty(formBase.name).length <= 100;
    const descOk = trimOrEmpty(formBase.description).length <= 255;
    const birthOk = isValidISODate(formBase.birthDate);

    if (!nameOk || !descOk || !birthOk) return false;

    if (role === 'student') {
      const courseOk = trimOrEmpty(formStudent.course).length <= 100;
      const regOk = trimOrEmpty(formStudent.registrationNumber).length <= 50;
      const lattesOk = trimOrEmpty(formStudent.lattes).length <= 255;
      return courseOk && regOk && lattesOk;
    }

    const fantasyOk = trimOrEmpty(formEnterprise.fantasyName).length <= 100;
    const cnpjOk = trimOrEmpty(formEnterprise.cnpj).length <= 18;
    const socialReasonOk = trimOrEmpty(formEnterprise.socialReason).length <= 100;
    return fantasyOk && cnpjOk && socialReasonOk;
  }, [formBase, role, formStudent, formEnterprise]);

  const addressValid = useMemo(() => {
    if (!hasAddress) {
      return trimOrEmpty(addressForm.zipCode).length > 0;
    }
    return true;
  }, [addressForm.zipCode, hasAddress]);

  const socialsValid = useMemo(() => {
    const urls = [socials.discord, socials.linkedin, socials.github].map(trimOrEmpty).filter(Boolean);
    try {
      urls.forEach((u) => new URL(u));
      return true;
    } catch {
      return false;
    }
  }, [socials]);

  const saveUser = async () => {
    if (!profile || !isProfileDirty || !profileValid) return;

    setSavingUser(true);
    setError(null);

    try {
      const updBase: any = {};
      if (trimOrEmpty(formBase.name) !== trimOrEmpty(initialBase.name)) {
        updBase.name = trimOrEmpty(formBase.name);
      }
      if (trimOrEmpty(formBase.description) !== trimOrEmpty(initialBase.description)) {
        updBase.description = trimOrEmpty(formBase.description) || null;
      }
      if (trimOrEmpty(formBase.birthDate) !== trimOrEmpty(initialBase.birthDate)) {
        updBase.birthDate = trimOrEmpty(formBase.birthDate) || null;
      }

      let updated: UserProfileResponseDto = profile;

      if (Object.keys(updBase).length > 0) {
        updated = await meService.updateProfile(updBase);
      }

      if (role === 'student') {
        const updStudent: UpdateStudentProfileDto = {};
        if (trimOrEmpty(formStudent.course) !== trimOrEmpty(initialStudent.course)) {
          updStudent.course = trimOrEmpty(formStudent.course) || null;
        }
        if (trimOrEmpty(formStudent.registrationNumber) !== trimOrEmpty(initialStudent.registrationNumber)) {
          updStudent.registrationNumber = trimOrEmpty(formStudent.registrationNumber) || null;
        }
        if (trimOrEmpty(formStudent.lattes) !== trimOrEmpty(initialStudent.lattes)) {
          updStudent.lattes = trimOrEmpty(formStudent.lattes) || null;
        }
        if (Object.keys(updStudent).length > 0) {
          updated = await meService.updateStudentProfile(updStudent);
        }
      } else {
        const updEnterprise: UpdateEnterpriseProfileDto = {};
        if (trimOrEmpty(formEnterprise.fantasyName) !== trimOrEmpty(initialEnterprise.fantasyName)) {
          updEnterprise.fantasyName = trimOrEmpty(formEnterprise.fantasyName) || null;
        }
        if (trimOrEmpty(formEnterprise.cnpj) !== trimOrEmpty(initialEnterprise.cnpj)) {
          updEnterprise.cnpj = trimOrEmpty(formEnterprise.cnpj) || null;
        }
        if (trimOrEmpty(formEnterprise.socialReason) !== trimOrEmpty(initialEnterprise.socialReason)) {
          updEnterprise.socialReason = trimOrEmpty(formEnterprise.socialReason) || null;
        }
        if (Object.keys(updEnterprise).length > 0) {
          updated = await meService.updateEnterpriseProfile(updEnterprise);
        }
      }

      setProfile(updated);

      const newBase = {
        name: trimOrEmpty(updated.name),
        description: trimOrEmpty(updated.description),
        birthDate: toDateInput(updated.birthDate),
      };
      setInitialBase(newBase);
      setFormBase(newBase);

      const newStudent = {
        course: trimOrEmpty(updated.student?.course),
        registrationNumber: trimOrEmpty(updated.student?.registrationNumber),
        lattes: trimOrEmpty(updated.student?.lattes),
      };
      setInitialStudent(newStudent);
      setFormStudent(newStudent);

      const newEnterprise = {
        fantasyName: trimOrEmpty(updated.enterprise?.fantasyName),
        cnpj: trimOrEmpty(updated.enterprise?.cnpj),
        socialReason: trimOrEmpty(updated.enterprise?.socialReason),
      };
      setInitialEnterprise(newEnterprise);
      setFormEnterprise(newEnterprise);

      alert('Perfil atualizado com sucesso!');
    } catch (e) {
      setError('Erro ao salvar o perfil.');
    } finally {
      setSavingUser(false);
    }
  };

  const saveAddress = async () => {
    if (!profile || !isAddressDirty || !addressValid) return;

    setSavingAddress(true);
    setError(null);

    try {
      let updated: UserProfileResponseDto;

      if (hasAddress) {
        const upd: UpdateAddressDirectDto = {};
        (['zipCode', 'street', 'neighborhood', 'city', 'state'] as (keyof CreateAddressDto)[]).forEach((k) => {
          if (trimOrEmpty(addressForm[k]) !== trimOrEmpty(initialAddress[k]) && trimOrEmpty(addressForm[k]) !== '') {
            (upd as any)[k] = trimOrEmpty(addressForm[k]);
          }
        });

        updated = await meService.updateAddress(upd);
      } else {
        const body: CreateAddressDto = {
          zipCode: trimOrEmpty(addressForm.zipCode),
          street: trimOrEmpty(addressForm.street) || undefined,
          neighborhood: trimOrEmpty(addressForm.neighborhood) || undefined,
          city: trimOrEmpty(addressForm.city) || undefined,
          state: trimOrEmpty(addressForm.state) || undefined,
        };
        updated = await meService.createAddress(body);
      }

      setProfile(updated);

      const addrSnap: CreateAddressDto = {
        zipCode: trimOrEmpty(updated.address?.zipCode),
        street: trimOrEmpty(updated.address?.street),
        neighborhood: trimOrEmpty(updated.address?.neighborhood),
        city: trimOrEmpty(updated.address?.city),
        state: trimOrEmpty(updated.address?.state),
      };
      setInitialAddress(addrSnap);
      setAddressForm(addrSnap);

      alert('Endereço atualizado com sucesso!');
    } catch {
      setError('Erro ao salvar o endereço.');
    } finally {
      setSavingAddress(false);
    }
  };

  const saveSocials = async () => {
    if (!isSocialsDirty || !socialsValid) return;

    setSavingSocials(true);
    setError(null);

    try {
      const baseEntries = Object.entries(socials)
        .map(([type, url]) => ({ type, url: trimOrEmpty(url) }))
        .filter((e) => !!e.url);

      const preserved = (initialOtherSocials ?? []).map((sm) => ({
        type: sm.type,
        url: sm.url,
      }));

      const payload = { socialMedia: [...baseEntries, ...preserved] };
      const updated = await meService.updateSocialMedia(payload as any);
      setProfile(updated);

      const map: SocialsForm = { discord: '', linkedin: '', github: '' };
      const others: SocialMediaItem[] = [];
      (updated.socialMedia ?? []).forEach((sm) => {
        if ((sm.type as keyof SocialsForm) in map) {
          (map as any)[sm.type] = sm.url ?? '';
        } else {
          others.push(sm);
        }
      });
      setInitialSocials(map);
      setSocials(map);
      setInitialOtherSocials(others.length ? others : undefined);

      alert('Links sociais atualizados com sucesso!');
    } catch {
      setError('Erro ao salvar os links sociais.');
    } finally {
      setSavingSocials(false);
    }
  };

  const handleCurriculumChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCurriculumFile(file);
    if (!file) return;

    setError(null);
    try {
      await meService.uploadCurriculum(file);
      alert('Currículo atualizado com sucesso!');
      void loadProfile();
    } catch {
      setError('Erro ao atualizar o currículo.');
    }
  };

  const handleHistoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setHistoryFile(file);
    if (!file) return;

    setError(null);
    try {
      await meService.uploadHistory(file);
      alert('Histórico atualizado com sucesso!');
      void loadProfile();
    } catch {
      setError('Erro ao atualizar o histórico.');
    }
  };

  const removeTag = async (uuid: string) => {
    setError(null);
    try {
      const updated = await meService.deleteTag(uuid);
      setProfile(updated);
      alert('Tag removida com sucesso!');
    } catch {
      setError('Erro ao remover a tag.');
    }
  };

  const addTag = async () => {
    const label = typeof window !== 'undefined' ? window.prompt('Digite o nome da nova tag:') : null;
    if (!label || !label.trim()) {
      setError('Tag não pode ser vazia.');
      return;
    }
    setError(null);
    try {
      const updated = await meService.addTag({ label: label.trim() });
      setProfile(updated);
      alert('Tag adicionada com sucesso!');
    } catch {
      setError('Erro ao adicionar a tag.');
    }
  };

  return (
    <LoadingBrand loading={loading}>
      <div className={styles.bannerEditWrapper}>
        <ImageUser editable />
      </div>

      <div className={styles.editProfile}>
        <h1 className={styles.title}>
          Editar perfil
        </h1>

        {error && <div className={styles.error} role="alert" aria-live="polite">{error}</div>}

        <div className={styles.section}>
          <h1 className={styles.title}>
            Dados Pessoais
          </h1>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void saveUser();
            }}
          >
            <div className={`${styles.row} ${styles.twoCols}`}>
              <div className={styles.field}>
                <label>Nome</label>
                <input
                  value={formBase.name}
                  onChange={(e) => onBaseChange('name', e.target.value)}
                  required
                  placeholder="Seu nome"
                  aria-required="true"
                />
              </div>
              <div className={styles.field}>
                <label>Data de nascimento</label>
                <input
                  type="date"
                  value={formBase.birthDate}
                  onChange={(e) => onBaseChange('birthDate', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label>Descrição</label>
                <textarea
                  value={formBase.description}
                  onChange={(e) => onBaseChange('description', e.target.value)}
                  placeholder="Um resumo sobre você (até 255 caracteres)"
                />
              </div>
            </div>

            {role === 'student' && (
              <>
                <div className={`${styles.row} ${styles.twoCols}`}>
                  <div className={styles.field}>
                    <label>Curso</label>
                    <input
                      value={formStudent.course}
                      onChange={(e) => onStudentChange('course', e.target.value)}
                      placeholder="Ex.: Ciência da Computação"
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Número da matrícula</label>
                    <input
                      value={formStudent.registrationNumber}
                      onChange={(e) => onStudentChange('registrationNumber', e.target.value)}
                      placeholder="2023118TADS0000"
                    />
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Link Lattes</label>
                    <input
                      value={formStudent.lattes}
                      onChange={(e) => onStudentChange('lattes', e.target.value)}
                      placeholder="https://lattes.cnpq.br/..."
                    />
                  </div>
                </div>
              </>
            )}

            {role === 'enterprise' && (
              <div className={`${styles.row} ${styles.twoCols}`}>
                <div className={styles.field}>
                  <label>Nome fantasia</label>
                  <input
                    value={formEnterprise.fantasyName}
                    onChange={(e) => onEnterpriseChange('fantasyName', e.target.value)}
                    placeholder="Ex.: TechPicos"
                  />
                </div>
                <div className={styles.field}>
                  <label>CNPJ</label>
                  <input
                    value={formEnterprise.cnpj}
                    onChange={(e) => onEnterpriseChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className={`${styles.field} ${styles.fullWidth}`}>
                  <label>Razão social</label>
                  <input
                    value={formEnterprise.socialReason}
                    onChange={(e) => onEnterpriseChange('socialReason', e.target.value)}
                    placeholder="Razão social"
                  />
                </div>
              </div>
            )}

            <button
              className={styles.btnSubmit}
              type="submit"
              disabled={savingUser || !isProfileDirty || !profileValid}
              title={!isProfileDirty ? 'Sem mudanças para salvar' : (!profileValid ? 'Preencha os campos corretamente' : 'Salvar')}
            >
              {savingUser ? 'Salvando…' : 'Salvar'}
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h1 className={styles.title}>Endereço</h1>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void saveAddress();
            }}
          >
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Rua</label>
                <input
                  value={addressForm.street}
                  onChange={(e) => onAddressChange('street', e.target.value)}
                  placeholder="Rua das Flores"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>CEP {hasAddress ? '(opcional)' : '(obrigatório)'}</label>
                <input
                  value={addressForm.zipCode}
                  onChange={(e) => onAddressChange('zipCode', e.target.value)}
                  placeholder="64000-000"
                />
              </div>
              <div className={styles.field}>
                <label>Estado</label>
                <input
                  value={addressForm.state}
                  onChange={(e) => onAddressChange('state', e.target.value)}
                  placeholder="PI"
                />
              </div>
            </div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Bairro</label>
                <input
                  value={addressForm.neighborhood}
                  onChange={(e) => onAddressChange('neighborhood', e.target.value)}
                  placeholder="Centro"
                />
              </div>
              <div className={styles.field}>
                <label>Cidade</label>
                <input
                  value={addressForm.city}
                  onChange={(e) => onAddressChange('city', e.target.value)}
                  placeholder="Teresina"
                />
              </div>
            </div>
            <button
              className={styles.btnSubmit}
              type="submit"
              disabled={savingAddress || !isAddressDirty || !addressValid}
              title={
                !isAddressDirty
                  ? 'Sem mudanças para salvar'
                  : (!addressValid ? (hasAddress ? 'Campos inválidos' : 'CEP é obrigatório para criar') : 'Salvar')
              }
            >
              {savingAddress ? 'Salvando…' : 'Salvar'}
            </button>
          </form>
        </div>

        <div className={styles.section}>
          <h1 className={styles.title}>Mídias sociais</h1>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              void saveSocials();
            }}
          >
            <div className={styles.row} style={{ flexDirection: 'column' as const }}>
              <div className={styles.field}>
                <label>LinkedIn</label>
                <input
                  value={socials.linkedin}
                  onChange={(e) => onSocialChange('linkedin', e.target.value)}
                  type="url"
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
              <div className={styles.field}>
                <label>GitHub</label>
                <input
                  value={socials.github}
                  onChange={(e) => onSocialChange('github', e.target.value)}
                  type="url"
                  placeholder="https://github.com/…"
                />
              </div>
            </div>

            <button
              className={styles.btnSubmit}
              type="submit"
              disabled={savingSocials || !isSocialsDirty || !socialsValid}
              title={
                !isSocialsDirty
                  ? 'Sem mudanças para salvar'
                  : (!socialsValid ? 'Preencha com URLs válidas' : 'Salvar links sociais')
              }
            >
              {savingSocials ? 'Salvando…' : 'Salvar links sociais'}
            </button>
          </form>
        </div>

        <div className={styles.section}>
          {role === 'student' && (
            <>
              <h1 className={styles.title}>Documentos</h1>
              <div className={`${styles.row} ${styles.twoCols}`}>
                <div className={styles.field}>
                  <label>Currículo (PDF)</label>
                  <label className={styles.fileBtn}>
                    {curriculumFile ? 'Alterar arquivo' : 'Selecionar'}
                    <input
                      type="file"
                      accept="application/pdf"
                      className={styles.hiddenInput}
                      onChange={handleCurriculumChange}
                    />
                  </label>
                  {curriculumFile && <small>{curriculumFile.name}</small>}
                </div>

                <div className={styles.field}>
                  <label>Histórico escolar (PDF)</label>
                  <label className={styles.fileBtn}>
                    {historyFile ? 'Alterar arquivo' : 'Selecionar'}
                    <input
                      type="file"
                      accept="application/pdf"
                      className={styles.hiddenInput}
                      onChange={handleHistoryChange}
                    />
                  </label>
                  {historyFile && <small>{historyFile.name}</small>}
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.section}>
          <div>
            <h1 className={styles.title}>Tags</h1>
            <p style={{ marginBottom: '.5rem' }}>
              Você pode adicionar tags para destacar suas habilidades, interesses ou áreas de atuação.
            </p>

            <div className={styles.tags}>
              {profile?.tags?.map((tag: TagItem) => (
                <span key={tag.uuid} className={styles.tag}>
                  {tag.label}
                  <button type="button" onClick={() => void removeTag(tag.uuid)}>×</button>
                </span>
              ))}

              <button type="button" className={styles.btnAddTag} onClick={() => void addTag()}>
                Adicionar tag
              </button>
            </div>
          </div>
        </div>
      </div>
    </LoadingBrand>
  );
}
