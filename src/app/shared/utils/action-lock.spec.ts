import { ActionLock, CANCELLED, minDuration } from './action-lock';

describe('ActionLock', () => {
  it('ignores clicks while busy and locks forever in once mode', async () => {
    const lock = new ActionLock();
    let release!: () => void;
    let calls = 0;
    const task = () => {
      calls++;
      return new Promise<string>((resolve) => (release = () => resolve('ok')));
    };

    const first = lock.run(task, 'once');
    const second = lock.run(task, 'once');
    expect(lock.busy()).toBe(true);
    expect(await second).toBeUndefined();

    release();
    expect(await first).toBe('ok');
    expect(lock.state()).toBe('locked');
    expect(await lock.run(task, 'once')).toBeUndefined();
    expect(calls).toBe(1);
  });

  it('returns to idle on error and on cancel', async () => {
    const lock = new ActionLock();
    await expect(lock.run(() => Promise.reject(new Error('x')))).rejects.toThrow('x');
    expect(lock.state()).toBe('idle');

    expect(await lock.run(() => Promise.resolve(CANCELLED))).toBeUndefined();
    expect(lock.state()).toBe('idle');
  });

  it('keeps the spinner for a minimum time', async () => {
    const started = Date.now();
    await minDuration(Promise.resolve(1), 50);
    expect(Date.now() - started).toBeGreaterThanOrEqual(45);
  });
});
