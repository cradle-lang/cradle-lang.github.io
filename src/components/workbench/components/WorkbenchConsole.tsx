import type {
  ConsoleMessage,
} from '../types/workbench';

type Props = {
  messages: ConsoleMessage[];
};

export default function WorkbenchConsole({
  messages,
}: Props) {
  return (
    <>
      {messages.map((message) => (
        <div
          key={message.id}
          data-message-type={message.type}
        >
          <span>
            {message.timestamp.toLocaleTimeString(
              [],
              {
                hour12: false,
              },
            )}
          </span>

          <span aria-hidden="true">
            {message.type === 'error'
              ? '×'
              : message.type === 'warning'
                ? '!'
                : message.type === 'success'
                  ? '✓'
                  : '›'}
          </span>

          <span>
            {message.message}
          </span>
        </div>
      ))}
    </>
  );
}
