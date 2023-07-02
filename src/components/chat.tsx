import { MessageOutlined } from '@ant-design/icons';
import { Button, Input, List, Result, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';

const { TextArea } = Input;

type ChatProps = {
  ownId: string;
  id: string;
  ws: WebSocket;
  onSend: (wsMessage: any) => void;
  messages: ChatMessage[];
};

export type ChatMessage = {
  fromName: string;
  toName: string;
  fromId: string;
  toId: string;
  text: string;
  dateTime: Date;
};

export const Chat = (props: ChatProps) => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    setTimeout(() => {
      (listContainerRef.current as any)!.scrollTop =
        (listContainerRef.current as any)!.scrollHeight; // TODO: not a good idea, just a temporary hack
    }, 0);
  }, [props.messages]);

  const listContainerRef = useRef(null);

  const handleSendMessage = () => {
    const preparedMessage = message.trim();
    let name = localStorage.getItem('name');

    if (!name) {
      name = prompt('Enter your name');
      if (name) {
        localStorage.setItem('name', name);
      }
    }

    if (preparedMessage.length && name) {
      const wsMessage = {
        type: 'chatMessage',
        recipientId: props.id,
        senderId: props.ownId,
        senderName: name,
        text: preparedMessage,
      };
      props.ws.send(JSON.stringify(wsMessage));
      props.onSend(wsMessage);
      setMessage('');
    }
  };

  const formatTime = (dateTime: Date) => {
    return `${dateTime.getHours().toString().padStart(2, '0')}:${dateTime
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${dateTime.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="messages-container" ref={listContainerRef}>
        {props.messages?.length ?
          <List
            className="messages"
            dataSource={props?.messages}
            renderItem={(item, index) => (
              <List.Item key={index}>
                <Tag>{formatTime(item.dateTime)}</Tag> <b>{item.fromName}</b>: {item.text}
              </List.Item>
            )}
            header={false}
            footer={false}
          />
          :
          <Result
            style={{
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              flexDirection: 'column',
            }}
            icon={<MessageOutlined />}
            title="Discuss the details of your meetup!"
            subTitle="Confirm the location, time, how to get to the place, availability of a game set, etc."
          />
        }
      </div>
      <TextArea
        rows={4}
        placeholder="Enter your message here!"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onPressEnter={(e) => {
          handleSendMessage();
          e.preventDefault();
        }}
      />
      <Button
        type="primary"
        size="large"
        style={{ margin: '10px 0 0' }}
        onClick={handleSendMessage}
      >
        Send
      </Button>
    </div>
  );
};
