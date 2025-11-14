import { SubscriptionResponseDto } from '@/api/auth/dto/register-admin-response.dto';
import { Subscription } from '@/core/domain/subscription/subscription.entity';

export class SubscriptionMapper {
  static toResponseDto(subscription: Subscription): SubscriptionResponseDto {
    return {
      id: subscription.id,
      adminId: subscription.adminId,
      planId: subscription.planId,
      startedAt: subscription.startedAt,
      isActive: subscription.isActive,
    };
  }
}
