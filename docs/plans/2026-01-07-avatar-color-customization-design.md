# Avatar Color Customization - Design Document

**Date:** 2026-01-07
**Status:** Approved
**Author:** Design Session with User

## Overview

Enable users to customize their avatar color by choosing from a predefined palette of 8 colors. Users receive a random color on account creation and can change it later through their profile settings.

## Current State

- `avatarColor` field exists in database (User model)
- Random color generated automatically on user creation (UserFactory)
- Color based on hash of firstName + lastName + email
- Initials system already implemented and working

## Requirements

1. Users must be able to change their avatar color after account creation
2. Color selection must use a predefined palette (not free color picker)
3. Palette must have 8 colors with good contrast for white text
4. Changes apply only to the authenticated user (no admin override)
5. Existing users keep their auto-generated colors until they choose to change

## Solution Design

### Color Palette

8 carefully selected colors with good contrast for white initials:

```typescript
export const AVATAR_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
] as const;
```

### API Endpoints

#### GET /users/me/avatar-colors

Returns available color palette.

**Response:**
```json
{
  "colors": [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316"
  ]
}
```

**Status Codes:**
- 200: Success
- 401: Unauthorized

#### PATCH /users/me/avatar-color

Updates the authenticated user's avatar color.

**Request Body:**
```json
{
  "avatarColor": "#3B82F6"
}
```

**Response:**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "avatarColor": "#3B82F6",
  "initials": "JD",
  ...
}
```

**Validations:**
- Color must be in predefined palette
- Must be valid hex color format
- User must be authenticated

**Status Codes:**
- 200: Success
- 400: Invalid color (not in palette)
- 401: Unauthorized

### Architecture

**Layer Structure:**
```
Controller (user.controller.ts)
  ↓
Service (update-user-avatar-color.service.ts)
  ↓
Repository (user.repository.ts)
  ↓
Database (Prisma)
```

**Files to Create:**

1. `src/shared/constants/avatar-colors.ts`
   - Export AVATAR_COLORS constant
   - Single source of truth for palette

2. `src/api/user/dto/update-avatar-color.dto.ts`
   - Validation using @IsIn(AVATAR_COLORS)
   - Ensures color is from palette

3. `src/application/services/user/update-user-avatar-color.service.ts`
   - Business logic for updating color
   - Receives userId from JWT token
   - Updates only avatarColor field

4. `src/api/user/user.controller.ts` (or modify existing)
   - GET /users/me/avatar-colors
   - PATCH /users/me/avatar-color

5. Tests for the service

**Files to Modify:**

1. `src/api/user/user.module.ts`
   - Register new service and controller

2. Repository files (if needed)
   - May already have update method

### Frontend Flow

1. User accesses profile/settings page
2. Sees current avatar with current color
3. Clicks to customize avatar
4. System displays 8 colors in 2x4 grid
5. User selects desired color
6. Avatar updates immediately (optimistic update)
7. Request sent to backend
8. On failure, revert to previous color

**Frontend Components:**

```tsx
// Display component
<Avatar
  initials={user.initials}
  color={user.avatarColor}
  size="lg"
/>

// Color picker component
<AvatarColorPicker
  currentColor={user.avatarColor}
  availableColors={colors}
  onColorSelect={(color) => updateAvatarColor(color)}
/>
```

**UX Considerations:**
- Visual indicator for currently selected color
- Immediate visual feedback on selection
- Loading state during request
- Success/error toast notifications

## Testing Strategy

**Unit Tests:**
- ✓ Update with valid color → success
- ✓ Update with invalid color → 400 error
- ✓ GET colors returns correct array
- ✓ Unauthenticated request → 401
- ✓ Verify only authenticated user can update their own color

**Integration Tests:**
- ✓ Full flow: create user → update color → verify persistence
- ✓ Color validation at DTO level
- ✓ Repository update works correctly

## Security Considerations

1. **Validation:** Strict palette validation prevents injection of malicious colors
2. **Authorization:** Only authenticated user can update their own color
3. **Rate Limiting:** Can be added if needed (not critical for this operation)

## Performance Considerations

1. **GET /avatar-colors:** Can use aggressive caching (colors don't change)
2. **PATCH /avatar-color:** Simple update operation, no performance impact
3. **Frontend:** Cache available colors locally

## Backward Compatibility

- Existing users keep auto-generated colors
- No migration needed (field already exists)
- Users can choose to change color at any time
- System continues working if user never changes color

## Future Enhancements

Easy to add later:
1. Expand palette (just update constant)
2. Profile photo upload (field already exists: `profileImageUrl`)
3. Theme support (dark/light) with contrast adjustments
4. Custom color picker as advanced option
5. Admin ability to change other users' colors (if needed)

## Trade-offs

**Decisions Made:**

| Choice | Alternative | Rationale |
|--------|-------------|-----------|
| Predefined palette | Free color picker | Better UX, guaranteed contrast, mobile-friendly |
| Separate endpoint | General update endpoint | More RESTful, clear responsibility |
| 8 colors | 12 or 16 colors | Sufficient variety without overwhelming UI |
| /users/me/* pattern | /users/:id/* | Security - users only change their own |

## Implementation Checklist

- [ ] Create avatar-colors.ts constant
- [ ] Create UpdateAvatarColorDto with validation
- [ ] Create update-user-avatar-color.service.ts
- [ ] Create/modify user.controller.ts with both endpoints
- [ ] Update user.module.ts
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Frontend: fetch colors API
- [ ] Frontend: update color API
- [ ] Frontend: AvatarColorPicker component
- [ ] Frontend: integrate into profile page
- [ ] E2E testing
- [ ] Documentation update
