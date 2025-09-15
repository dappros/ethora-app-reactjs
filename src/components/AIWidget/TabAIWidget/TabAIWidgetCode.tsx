import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import { ReactElement } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface TabAIWidgetCodeProps {
  value: string;
  copied?: boolean;
  scriptCode: string;
  appId?: string;
  userId?: string;
  handleChange: (_: React.SyntheticEvent, newValue: string) => void;
  handleCopy: (text: string) => void;
}

export const TabAIWidgetCode = ({
  value,
  copied,
  scriptCode,
  appId,
  userId,
  handleChange,
  handleCopy,
}: TabAIWidgetCodeProps): ReactElement => {
  return (
    <>
      <div className="font-semibold font-sans text-[16px] my-4">Code</div>
      <p className="font-sans text-sm pb-4 flex items-center gap-1">
        Use this code to integrate widget into your website or external app.
      </p>

      <Box>
        <ButtonGroup variant="outlined" size="small" aria-label="code tabs">
          <Button
            onClick={(e) => handleChange(e, '1')}
            variant={value === '1' ? 'contained' : 'outlined'}
            aria-pressed={value === '1'}
          >
            HTML Widget
          </Button>
          <Button
            onClick={(e) => handleChange(e, '2')}
            variant={value === '2' ? 'contained' : 'outlined'}
            aria-pressed={value === '2'}
          >
            Wordpress
          </Button>
        </ButtonGroup>
      </Box>

      {value === '1' && (
        <Box sx={{ pt: 3 }}>
          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            {`Insert this code anywhere inside your <body> tag:`}
          </p>
          <div className="relative rounded-md bg-gray-700">
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? 'Copied' : 'Copy'}>
                <IconButton onClick={() => handleCopy(scriptCode)} size="small">
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            <SyntaxHighlighter
              language="html"
              style={oneDark}
              customStyle={{
                fontSize: '0.875rem',
                background: 'transparent',
                padding: '1rem 2.5rem 1rem 1rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                overflowX: 'auto',
              }}
              showLineNumbers={true}
              wrapLongLines={true}
              wrapLines={true}
              lineProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
            >
              {scriptCode}
            </SyntaxHighlighter>
          </div>
        </Box>
      )}

      {/* Панель 2: Wordpress */}
      {value === '2' && (
        <Box sx={{ pt: 3 }}>
          <p className="font-sans text-sm pb-4 flex items-center gap-1">
            Insert this bot ID in your Wordpress{' '}
            <a href="" className="text-brand-500">
              Ethora AI Assistant plugin
            </a>{' '}
            settings:
          </p>
          <div className="relative rounded-md bg-gray-700">
            <div className="absolute top-1 right-1 z-10">
              <Tooltip title={copied ? 'Copied' : 'Copy'}>
                <IconButton
                  onClick={() =>
                    handleCopy(
                      appId && userId
                        ? `${appId}_${userId}-bot@xmpp.ethoradev.com`
                        : ''
                    )
                  }
                  size="small"
                >
                  {copied ? (
                    <CheckIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  ) : (
                    <ContentCopyIcon
                      fontSize="small"
                      className="text-white hover:text-gray-300"
                    />
                  )}
                </IconButton>
              </Tooltip>
            </div>
            <SyntaxHighlighter
              language="html"
              style={oneDark}
              customStyle={{
                fontSize: '0.875rem',
                background: 'transparent',
                padding: '1rem 2.5rem 1rem 1rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                overflowX: 'auto',
              }}
              showLineNumbers={false}
              wrapLongLines={true}
              wrapLines={true}
              lineProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
              codeTagProps={{
                style: {
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                },
              }}
            >
              {appId && userId
                ? `${appId}_${userId}-bot@xmpp.ethoradev.com`
                : ''}
            </SyntaxHighlighter>
          </div>
        </Box>
      )}
    </>
  );
};
