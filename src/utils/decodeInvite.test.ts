import { decodeInvite } from './decodeInvite';

const encode = (value: string) => window.btoa(value);

describe('decodeInvite', () => {
  it('decodes a valid invite', () => {
    expect(decodeInvite(encode('Friends:x:7:y'))).toEqual({
      isInviteStructureValid: true,
      groupName: 'Friends',
      id: 7,
    });
  });

  it.each([
    ['null', null],
    ['an empty string', ''],
    ['non-base64 input', '%%%not-base64%%%'],
    ['too few parts', encode('Friends:x:7')],
    ['too many parts', encode('Friends:x:7:y:z')],
    ['a non-numeric id', encode('Friends:x:abc:y')],
    ['a zero id', encode('Friends:x:0:y')],
    ['a negative id', encode('Friends:x:-3:y')],
    ['a fractional id', encode('Friends:x:1.5:y')],
  ])('flags %s as invalid without throwing', (_, invite) => {
    const result = decodeInvite(invite);

    expect(result.isInviteStructureValid).toBe(false);
    expect(result.groupName).toBe('');
    expect(result.id).toBeNaN();
  });
});
