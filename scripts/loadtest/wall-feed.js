import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp up
    { duration: '1m', target: 200 },   // sustain
    { duration: '30s', target: 500 },  // spike
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<400'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'https://uniqueapp.fun';

export default function () {
  const res = http.get(`${BASE}/wall`);
  check(res, {
    'status 200': (r) => r.status === 200,
    'has HTML': (r) => r.body && r.body.length > 1000,
  });
  sleep(1);
}
