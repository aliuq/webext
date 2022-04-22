import { useStorageLocal } from '~/composables/useStorageLocal'

export const sign = useStorageLocal('my-sign', 'Hope for the best and prepare for the worst.', { listenToStorageChanges: true })
