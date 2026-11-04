// Fixture hostil: escrita em storage por caminhos indiretos (FRT-SEG-01).
export function save(value: string): void {
  window.localStorage.setItem('token', value);
  globalThis.sessionStorage.setItem('session', value);
}
