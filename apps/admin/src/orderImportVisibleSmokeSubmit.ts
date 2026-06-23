import {
  type OrderImportApiClient,
  type OrderImportCsvTextSubmitInput,
  type OrderImportStorageObjectSubmitInput
} from "./orderImportApiClient";

export type M4VisibleSmokeConfig = {
  enabled?: boolean;
  now?: string;
  queryRef?: string;
  storageSubmit?: OrderImportStorageObjectSubmitInput;
  submit?: OrderImportCsvTextSubmitInput;
};

const submittedSmokeJobs = new Map<string, Promise<string>>();

export async function submitVisibleSmokeJobOnce(
  client: OrderImportApiClient,
  smokeConfig: M4VisibleSmokeConfig
) {
  const submit = smokeConfig.submit;
  const storageSubmit = smokeConfig.storageSubmit;
  if (submit && storageSubmit) {
    throw new Error("order import smoke submit config is ambiguous");
  }
  if (submit) {
    return submitSmokeJobOnce(`csv:${submit.importJobId}:${submit.sourceRef}`, () =>
      client.submitImportCsvTextJob(submit)
    );
  }
  if (storageSubmit) {
    return submitSmokeJobOnce(
      `storage:${storageSubmit.importJobId}:${storageSubmit.bucketId}/${storageSubmit.objectPath}`,
      () => client.submitImportStorageObjectJob(storageSubmit)
    );
  }
  return undefined;
}

async function submitSmokeJobOnce(
  submitKey: string,
  submitAction: () => ReturnType<OrderImportApiClient["submitImportCsvTextJob"]>
) {
  const existingSubmit = submittedSmokeJobs.get(submitKey);
  if (existingSubmit) return existingSubmit;
  const nextSubmit = submitAction().then((submitResult) => submitResult.importJobId);
  submittedSmokeJobs.set(submitKey, nextSubmit);
  return nextSubmit;
}
