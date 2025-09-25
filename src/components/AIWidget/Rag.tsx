import { ReactElement, RefObject } from 'react';

interface RagProps {
  ragRef: RefObject<HTMLDivElement>;
}

export const Rag = ({ ragRef }: RagProps): ReactElement => {
  return (
    <>
      <div
        ref={ragRef}
        className="font-semibold font-sans text-[16px] pb-4 pt-8 text-blue-600"
      >
        RAG (Retrieval Augmented Generation)
      </div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 text-blue-600">
        This feature allows you to augment your LLM-powered AI agent chat bot
        with your own context data. Just index your website or upload documents
        that provide additional information e.g. your products and services.
      </p>
      <p className="font-sans text-sm pb-4 flex items-center gap-1 text-blue-600">
        Your data will be converted into vector space embeddings used by your AI
        agent as its “external memory” when answering users queries.
      </p>
      <p className="font-sans text-sm pb-4 text-blue-600 items-center gap-1 mb-8 inline-block">
        This allows you to{' '}
        <strong>create your own project-specific AI agents</strong> without
        being limited by the prompt context window size.
      </p>
    </>
  );
};
