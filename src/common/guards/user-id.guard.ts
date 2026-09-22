import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class UserIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const userId = request.headers['x-user-id'];

    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException('Missing x-user-id header');
    }

    request.userId = userId;

    return true;
  }
}
