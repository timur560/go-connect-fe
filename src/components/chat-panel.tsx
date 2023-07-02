import { Empty, Modal, Tabs } from 'antd';
import { Chat, ChatMessage } from './chat';

type TargetKey = React.MouseEvent | React.KeyboardEvent | string;

export type ChatItem = {
  id: string;
  name: string;
};

type ChatPanelProps = {
  items: ChatItem[];
  ws: WebSocket;
  ownId: string;
  messages: { [key: string]: ChatMessage[] };
  onSend: (wsMessage: any) => void;
  onCloseChat: (id: string) => void;
  activeKey: string;
  onChange: (activeKey: string) => void;
};

export const ChatPanel = (props: ChatPanelProps) => {
  if (!props.items.length) {
    return (
      <Empty
        style={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
        description="No active conversations"
      />
    );
  }

  const onEdit = (targetKey: TargetKey, action: 'add' | 'remove') => {
    if (action === 'remove') {
      Modal.confirm({
        title: 'Close chat?',
        content: 'Chat history will be cleared.',
        onOk: () => {
          props.onCloseChat(targetKey as string);
        },
      });
    }
  };

  return (
    <Tabs
      activeKey={props.activeKey}
      onChange={props.onChange}
      hideAdd
      type="editable-card"
      onEdit={onEdit}
      items={props.items.map((i) => ({
        key: i.id,
        label: (
          <span>
            {/* <Image
              height={18}
              style={{ paddingRight: 10 }}
              src="/images/go.png"
            /> */}
            {i.name}
          </span>
        ),
        children: (
          <Chat
            id={i.id}
            ws={props.ws}
            ownId={props.ownId}
            messages={props.messages[i.id]}
            onSend={props.onSend}
          />
        ),
      }))}
    />
  );
};
