import { Observable } from 'rxjs';
import { EffectError } from '@rx-signals/store';

export const handleError = (message: string, error: any) =>
  alert(`${message}: ${error?.message ?? error}`);

export const handleErrors = <T>(
  errorEvents: Observable<EffectError<T>>,
  messageGetter: (input: T) => string,
) => {
  errorEvents.subscribe(e => handleError(messageGetter(e.errorInput), e.error));
};
