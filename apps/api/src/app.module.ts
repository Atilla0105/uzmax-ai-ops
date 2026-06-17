import { Module } from "@nestjs/common";

import * as api from "./access-context.ts";

@Module({
  controllers: [api.ApiAccessContextController, api.ApiHealthController],
  providers: [
    api.ApiAccessContextGuard,
    api.ApiAccessContextService,
    { provide: api.API_AUDIT_SINK, useClass: api.InMemoryAuditSink },
    { provide: api.API_AUTHZ_REPOSITORY, useClass: api.DisabledAuthzRepository },
    {
      provide: api.API_IDENTITY_VERIFIER,
      useFactory: () => api.createIdentityVerifierFromEnv()
    }
  ]
})
export class AppModule {}
