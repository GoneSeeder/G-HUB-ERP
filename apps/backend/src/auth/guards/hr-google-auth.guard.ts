import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class HrGoogleAuthGuard extends AuthGuard('google-hr') {}
