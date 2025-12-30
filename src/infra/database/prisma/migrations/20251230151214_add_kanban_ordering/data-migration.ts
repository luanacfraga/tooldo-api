import { PrismaClient, ActionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration for Kanban Ordering...\n');

  // ============================================
  // Step 1: Create KanbanOrder for actions without one
  // ============================================
  console.log('Step 1: Checking for actions without KanbanOrder...');

  const actionsWithoutOrder = await prisma.action.findMany({
    where: {
      kanbanOrder: null,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (actionsWithoutOrder.length > 0) {
    console.log(`Found ${actionsWithoutOrder.length} actions without KanbanOrder, creating...\n`);

    // Track positions per column
    const columnPositions: Record<ActionStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    // Get max position per column for existing records
    const existingOrders = await prisma.kanbanOrder.findMany({
      select: {
        column: true,
        position: true,
      },
    });

    for (const order of existingOrders) {
      if (order.position >= columnPositions[order.column]) {
        columnPositions[order.column] = order.position + 1;
      }
    }

    console.log('Current max positions per column:', columnPositions);

    // Create KanbanOrder for each action without one
    for (const action of actionsWithoutOrder) {
      const column = action.status;
      const position = columnPositions[column];

      await prisma.kanbanOrder.create({
        data: {
          actionId: action.id,
          column,
          position,
          sortOrder: position,
          lastMovedAt: action.updatedAt,
          createdAt: action.createdAt,
        },
      });

      columnPositions[column]++;
    }

    console.log(`✓ Created KanbanOrder for ${actionsWithoutOrder.length} actions\n`);
  } else {
    console.log('✓ All actions already have KanbanOrder records\n');
  }

  // ============================================
  // Step 2: Update existing KanbanOrder records
  // ============================================
  console.log('Step 2: Updating existing KanbanOrder records with new fields...');

  // The new fields (created_at, last_moved_at) have default values from the migration,
  // but we want to set them based on the action data for accuracy
  const ordersToUpdate = await prisma.kanbanOrder.findMany({
    include: {
      action: true,
    },
  });

  console.log(`Found ${ordersToUpdate.length} existing KanbanOrder records to potentially update`);

  let updatedCount = 0;
  for (const order of ordersToUpdate) {
    // Check if we need to update timestamps
    const needsUpdate =
      order.createdAt.getTime() !== order.action.createdAt.getTime() ||
      order.lastMovedAt.getTime() !== order.action.updatedAt.getTime();

    if (needsUpdate) {
      await prisma.kanbanOrder.update({
        where: { id: order.id },
        data: {
          createdAt: order.action.createdAt,
          lastMovedAt: order.action.updatedAt,
        },
      });
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    console.log(`✓ Updated ${updatedCount} KanbanOrder records with accurate timestamps\n`);
  } else {
    console.log('✓ All KanbanOrder records already have accurate timestamps\n');
  }

  // ============================================
  // Step 3: Calculate timeSpent for ActionMovements
  // ============================================
  console.log('Step 3: Calculating timeSpent for existing ActionMovements...');

  // Get all actions with movements
  const actionsWithMovements = await prisma.action.findMany({
    where: {
      movements: {
        some: {},
      },
    },
    include: {
      movements: {
        orderBy: { movedAt: 'asc' },
      },
    },
  });

  console.log(`Found ${actionsWithMovements.length} actions with movement history`);

  let movementsUpdated = 0;
  for (const action of actionsWithMovements) {
    const movements = action.movements;

    for (let i = 0; i < movements.length; i++) {
      const movement = movements[i];

      // Skip if timeSpent is already set
      if (movement.timeSpent !== null) {
        continue;
      }

      // Calculate time spent in previous status
      let timeSpent: number | null = null;

      if (i === 0) {
        // First movement: time from action creation to first move
        timeSpent = Math.floor(
          (movement.movedAt.getTime() - action.createdAt.getTime()) / 1000
        );
      } else {
        // Subsequent movements: time from previous movement to current
        const previousMovement = movements[i - 1];
        timeSpent = Math.floor(
          (movement.movedAt.getTime() - previousMovement.movedAt.getTime()) / 1000
        );
      }

      // Update the movement with calculated timeSpent
      await prisma.actionMovement.update({
        where: { id: movement.id },
        data: { timeSpent },
      });

      movementsUpdated++;
    }
  }

  if (movementsUpdated > 0) {
    console.log(`✓ Updated ${movementsUpdated} ActionMovement records with timeSpent\n`);
  } else {
    console.log('✓ All ActionMovement records already have timeSpent calculated\n');
  }

  // ============================================
  // Summary
  // ============================================
  console.log('=======================================');
  console.log('Data migration completed successfully!');
  console.log('=======================================');
  console.log(`Actions with KanbanOrder: ${await prisma.kanbanOrder.count()}`);
  console.log(`Total ActionMovements: ${await prisma.actionMovement.count()}`);
  console.log('=======================================\n');
}

main()
  .catch((e) => {
    console.error('Error during data migration:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
