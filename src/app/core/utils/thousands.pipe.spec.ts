import { ThousandsPipe } from './thousands.pipe';

describe('ThousandsPipe', () => {
  it('create an instance', () => {
    const pipe = new ThousandsPipe();
    expect(pipe).toBeTruthy();
  });
});
