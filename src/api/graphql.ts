import { LoginManager } from '../utils/LoginManager';
import { AuthHandler } from '../utils/AuthHandler';

export const GRAPHQL_URL = 'https://maps-gray.vercel.app/api/graphql';
// export const GRAPHQL_URL = 'http://localhost:4000/api/graphql';

type GQLError = { message: string };

export async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
  skipCompanyId: boolean = false
): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };

  if (!skipCompanyId) {
    const companyId = await LoginManager.getCompanyId();
    if (!companyId) {
      AuthHandler.triggerLogout();
      throw new Error('Company ID is missing. Please login again.');
    }
    headers['x-company-id'] = companyId;
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors?.length) {
    const first = (json.errors as GQLError[])[0]?.message ?? 'GraphQL error';
    throw new Error(first);
  }
  return json.data as T;
}


