export type AxiosErrorLike<T = any> = {
  isAxiosError: true;
  response?: {
    status: number;
    data?: T;
  };
};

export function isAxiosError<T = any>(e: unknown): e is AxiosErrorLike<T> {
  return !!(
    e &&
    typeof e === 'object' &&
    (e as any).isAxiosError === true
  );
}
