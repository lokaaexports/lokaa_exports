import { sendOtpEmail } from '../lib/email-service'

// since it's typescript we can't easily run it directly with node unless we use ts-node or tsx.
// Let's create a script that runs via tsx since this is a nextjs project and may not have tsx installed globally.
