import { AVATAR_COLORS } from '@/shared/constants/avatar-colors';
import { validate } from 'class-validator';
import { UpdateAvatarColorDto } from './update-avatar-color.dto';

describe('UpdateAvatarColorDto', () => {
  describe('avatarColor validation', () => {
    it('should pass validation with a valid color from AVATAR_COLORS', async () => {
      const dto = new UpdateAvatarColorDto();
      dto.avatarColor = '#3B82F6';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation for all colors in AVATAR_COLORS', async () => {
      for (const color of AVATAR_COLORS) {
        const dto = new UpdateAvatarColorDto();
        dto.avatarColor = color;

        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      }
    });

    it('should fail validation when avatarColor is not a string', async () => {
      const dto = new UpdateAvatarColorDto();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dto as any).avatarColor = 123;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('avatarColor');
      expect(errors[0].constraints).toHaveProperty('isString');
      expect(errors[0].constraints?.isString).toBe(
        'A cor do avatar deve ser uma string',
      );
    });

    it('should fail validation when avatarColor is not in AVATAR_COLORS', async () => {
      const dto = new UpdateAvatarColorDto();
      dto.avatarColor = '#FFFFFF';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('avatarColor');
      expect(errors[0].constraints).toHaveProperty('isIn');
      expect(errors[0].constraints?.isIn).toBe(
        'A cor do avatar deve ser uma das cores predefinidas',
      );
    });

    it('should fail validation when avatarColor is an invalid color format', async () => {
      const dto = new UpdateAvatarColorDto();
      dto.avatarColor = 'blue';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('avatarColor');
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should fail validation when avatarColor is empty', async () => {
      const dto = new UpdateAvatarColorDto();
      dto.avatarColor = '';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('avatarColor');
      expect(errors[0].constraints).toHaveProperty('isIn');
    });

    it('should fail validation when avatarColor is undefined', async () => {
      const dto = new UpdateAvatarColorDto();

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('avatarColor');
    });

    it('should fail validation when avatarColor is null', async () => {
      const dto = new UpdateAvatarColorDto();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dto as any).avatarColor = null;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('avatarColor');
    });
  });
});
