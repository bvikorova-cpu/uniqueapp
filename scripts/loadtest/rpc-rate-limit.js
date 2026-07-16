import http from 'k6/http';
import { check } from 'k6';

// Exercises the check_rate_limit RPC to confirm it holds under burst.
export const options = {
  scenarios: {
    burst: {
      executor: 'constant-arrival-rate',
      rate: 100,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

const SUPABASE_URL = __ENV.SUPABASE_URL;
const ANON = __ENV.SUPABASE_ANON_KEY;

export default function () {
  const res = http.post(
    `${SUPABASE_URL}/rest/v1/rpc/check_rate_limit`,
    JSON.stringify({ _bucket: `loadtest:${__VU}`, _max: 60, _window_seconds: 60 }),
    {
      headers: {
        apikey: ANON,
        Authorization: `Bearer ${ANON}`,
        'Content-Type': 'application/json',
      },
    }
  );
  check(res, { 'status 200': (r) => r.status === 200 });
}
