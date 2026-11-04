// Fixture hostil: HTTP fora do módulo único, axios e zod direto.
import axios from 'axios';
import { z } from 'zod';

export async function load(): Promise<unknown> {
  const response = await fetch('/api/items');
  const viaXhr = new XMLHttpRequest();
  void viaXhr;
  void axios;
  void z;
  return response.json();
}
