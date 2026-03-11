// previne ataques de redirecionamento aberto, garantindo que o URL seja relativo e seguro.
export function getSafeRedirect(url: string | null | undefined): string {
  const defaultUrl = '/dashboard';

  if (!url) return defaultUrl;

  // 1. Deve começar com /
  // 2. Não pode começar com // (protocolo relativo que engana o navegador)
  // 3. Não pode começar com /\ (alguns browsers convertem para /)
  const isSafe = url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\');

  return isSafe ? url : defaultUrl;
}
