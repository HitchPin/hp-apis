export interface paths {
    "/": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Register a pre-printed receipt so that the client can securely retrieve the PDF copy.
         * @description Create pre-rendered receipt the invoice id.
         */
        post: operations["ShortenUrl"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /**
         * @description How long before the link stops working.
         * @default P1D
         */
        External: string;
        ShortenUrlRequest: {
            /** Format: uri */
            url: string;
            /** @enum {string} */
            kind: "sqids" | "nanoids";
            /** @description Group to associate this short link with. This determines the shuffled alphabet to use, as well as what monotically increasing series to use for applicable sequencers. */
            group: string;
            maxAge?: components["schemas"]["External"];
            /**
             * @description How long to keep a record of this short link. This affects whether or not its possible to re-issue this short link again, as well as for what duration of time after expiration that the oritingal URL will return a 410 Gone. After retention period is up, it will start returning a 404.
             * @default P1M
             */
            recordsRetention: string;
            /**
             * @description Minimum number of random characters to pull from.
             * @default 20
             */
            minEntropy: number;
            /**
             * @description Maximum number of random characters to pull from.
             * @default 64
             */
            maxEntropy: number;
            template: string;
        };
        ShortenUrlResponse: {
            /** Format: uri */
            shortUrl: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    ShortenUrl: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "application/json": components["schemas"]["ShortenUrlRequest"];
            };
        };
        responses: {
            /** @description Response that can be used to retrieve the receipt PDF. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ShortenUrlResponse"];
                };
            };
            /** @description Could not find rendered receipt. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        type: string;
                        message: string;
                    };
                };
            };
        };
    };
}
