import { BlockActionService } from '@/application/services/action/block-action.service';
import { CreateActionService } from '@/application/services/action/create-action.service';
import { DeleteActionService } from '@/application/services/action/delete-action.service';
import { GenerateActionPlanService } from '@/application/services/action/generate-action-plan.service';
import { ListActionsService } from '@/application/services/action/list-actions.service';
import { MoveActionService } from '@/application/services/action/move-action.service';
import { UpdateActionService } from '@/application/services/action/update-action.service';
import { AddChecklistItemService } from '@/application/services/checklist/add-checklist-item.service';
import { ToggleChecklistItemService } from '@/application/services/checklist/toggle-checklist-item.service';
import { DatabaseModule } from '@/infra/database/database.module';
import { SharedServicesModule } from '@/infra/services/shared-services.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [DatabaseModule, SharedServicesModule],
  providers: [
    CreateActionService,
    ListActionsService,
    UpdateActionService,
    DeleteActionService,
    MoveActionService,
    BlockActionService,
    GenerateActionPlanService,
    AddChecklistItemService,
    ToggleChecklistItemService,
  ],
  exports: [
    CreateActionService,
    ListActionsService,
    UpdateActionService,
    DeleteActionService,
    MoveActionService,
    BlockActionService,
    GenerateActionPlanService,
    AddChecklistItemService,
    ToggleChecklistItemService,
  ],
})
export class ActionApplicationModule {}
