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
        <div key={message.id}>
          <span>
            {message.timestamp.toLocaleTimeString(
              [],
              {
                hour12: false,
              },
            )}
          </span>

          <span>›</span>

          <span>
            {message.message}
          </span>
        </div>
      ))}
    </>
  );
}