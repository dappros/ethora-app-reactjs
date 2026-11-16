// The AI widget's global API (window.EthoraAssistant), set by assistant.js
// once it loads. The embed code tab reads its attribute list.
type EthoraAssistantApi = {
  reset(): void;
  destroy(): void;
  isMounted(): boolean;
  attributes: {
    name: string;
    group: string;
    required?: boolean;
    deprecatedAliasFor?: string;
    example: string;
    doc: string;
  }[];
  version: string;
};

declare global {
  interface Window {
    EthoraAssistant?: EthoraAssistantApi;
  }
}

export {};
