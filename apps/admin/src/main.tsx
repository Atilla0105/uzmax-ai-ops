import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import {
  createCustomerAssetApiClient,
  type CustomerAssetApiClient
} from "./customerAssetApiClient";

type CustomerAssetApiClientContractAnchor = {
  client: typeof createCustomerAssetApiClient;
  instance: CustomerAssetApiClient;
};
const customerAssetApiClientContractAnchor: Pick<
  CustomerAssetApiClientContractAnchor,
  "client"
> = {
  client: createCustomerAssetApiClient
};
void customerAssetApiClientContractAnchor;

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
