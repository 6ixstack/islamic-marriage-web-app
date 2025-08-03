declare module 'express' {
  import express from 'express';
  export = express;
}

declare module 'cors' {
  import cors from 'cors';
  export = cors;
}

declare module 'helmet' {
  import helmet from 'helmet';
  export = helmet;
}

declare module 'express-rate-limit' {
  import rateLimit from 'express-rate-limit';
  export = rateLimit;
}