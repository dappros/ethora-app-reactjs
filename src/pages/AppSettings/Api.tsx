import cn from 'classnames';
import { CopyButton } from '../../components/CopyButton';
import { Secret } from '../../components/Secret';
import { ModelApp } from '../../models';
import './Api.scss';

interface Props {
  app: ModelApp;
}

const sectionTitle = 'font-semibold font-sans text-normal mb-2';
const body = 'text-gray-500 text-sm font-sans';
const card = 'p-4 border border-gray-200 rounded-xl mb-8';

export const Api = ({ app }: Props) => {
  return (
    <div className="overflow-hidden">
      <div className={sectionTitle}>App credentials</div>
      <p className={cn(body, 'mb-4')}>
        Every app has an <strong>App ID</strong> and an{' '}
        <strong>App Secret</strong>. The App ID identifies your app to the
        Ethora API. The App Secret is the signing key your backend uses to mint
        the tokens that authenticate API calls. Keep the secret on a server you
        control: anything holding it can act as your app.
      </p>

      <div className={card}>
        <div className="mx-2 hidden-scroll overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="w-1/2 r-delimiter px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-l-lg">
                  App ID
                </th>
                <th className="w-1/2 px-4 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-r-lg">
                  App Secret
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={cn('hover:!bg-[#F5F7F9]')}>
                <td className="r-delimiter px-4 py-[20px] font-sans font-normal text-sm rounded-l-lg">
                  <div className="flex justify-items-center">
                    <span className="mr-2">{app._id}</span>
                    <CopyButton value={app._id} />
                  </div>
                </td>
                <td className=" px-4 font-sans font-normal text-sm text-center rounded-r-lg whitespace-nowrap">
                  <div className="flex justify-items-center">
                    <Secret className="mr-2" value={app.appSecret} />
                    <CopyButton value={app.appSecret} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={cn(body, 'mt-4 mb-0 px-2')}>
          Rotating the secret replaces the pair. Anything still using the old
          secret stops working immediately, so update your deployed code first.
        </p>
      </div>

      <div className={sectionTitle}>Which credential do I need?</div>
      <p className={cn(body, 'mb-4')}>
        Ethora accepts three kinds of credential. Pick by who is calling, not by
        what you are building.
      </p>

      <div className={card}>
        <div className="mx-2 hidden-scroll overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FCFCFC]">
                <th className="px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left whitespace-nowrap rounded-l-lg">
                  Credential
                </th>
                <th className="px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left">
                  Use it when
                </th>
                <th className="px-4 py-2 text-gray-500 font-normal font-inter text-xs text-left rounded-r-lg whitespace-nowrap">
                  How you get it
                </th>
              </tr>
            </thead>
            <tbody className="font-sans font-normal text-sm">
              <tr className="hover:!bg-[#F5F7F9]">
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  User token
                </td>
                <td className="px-4 py-3 align-top text-gray-600">
                  A person is signed in and acting as themselves, in your app or
                  in an assistant.
                </td>
                <td className="px-4 py-3 align-top text-gray-600">
                  Sign in, or use an API key.
                </td>
              </tr>
              <tr className="hover:!bg-[#F5F7F9]">
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  App token
                </td>
                <td className="px-4 py-3 align-top text-gray-600">
                  Your backend is doing something scoped to this one app:
                  broadcasts, indexing sources, bot configuration.
                </td>
                <td className="px-4 py-3 align-top text-gray-600">
                  Signed from the App Secret, or minted through the app-tokens
                  API.
                </td>
              </tr>
              <tr className="hover:!bg-[#F5F7F9]">
                <td className="px-4 py-3 align-top whitespace-nowrap">
                  Server (B2B) token
                </td>
                <td className="px-4 py-3 align-top text-gray-600">
                  Your backend is provisioning on behalf of the tenant: creating
                  apps, batch user creation, managing app tokens.
                </td>
                <td className="px-4 py-3 align-top text-gray-600">
                  Signed from the App Secret.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className={sectionTitle}>Connect an AI assistant</div>
      <p className={cn(body, 'mb-2')}>
        You do not need any of the above to use Ethora from Claude, ChatGPT,
        Cursor or Claude Code. Connect the hosted MCP server and sign in there
        instead:
      </p>
      <div className={card}>
        <div className="flex items-center px-2">
          <code className="font-mono text-sm mr-2 break-all">
            https://mcp.chat.ethora.com/mcp/oauth
          </code>
          <CopyButton value="https://mcp.chat.ethora.com/mcp/oauth" />
        </div>
        <p className={cn(body, 'mt-4 mb-0 px-2')}>
          For a client that cannot run a sign-in flow, take a personal connector
          URL from <strong>Account &rarr; AI Assistants</strong> instead. Either
          way the assistant acts as you, so it never needs the App Secret.
        </p>
      </div>
    </div>
  );
};
