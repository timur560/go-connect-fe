import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Carousel, Checkbox, Image } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import Modal from 'antd/es/modal/Modal';
import Paragraph from 'antd/es/typography/Paragraph';
import Title from 'antd/es/typography/Title';
import { MIN_WIDTH } from 'data/constants';
import useWindowDimensions from 'hooks/use-window-dimentions';
import { useEffect, useState } from 'react';

export const IntroModal = () => {
  const [open, setOpen] = useState<boolean>(false);
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (localStorage.getItem('introDisabled')) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, []);

  const handleChangeCheckbox = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      localStorage.setItem('introDisabled', '1');
    } else {
      localStorage.removeItem('introDisabled');
    }
  }
  return (
    <>
      {width > MIN_WIDTH &&
        <Button
          icon={<QuestionCircleOutlined />}
          size="large"
          className="border-button--bottom"
          onClick={() => setOpen(true)}
        />
      }
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={<div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignContent: 'center' }}>
          <div>
            <Checkbox style={{ color: 'white' }} onChange={handleChangeCheckbox}>Do not show this again</Checkbox>
          </div>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>}
        wrapClassName="intro-wrap"
        style={{ padding: 0}}
        closable={false}
        maskClosable={false}
      >
        <Carousel>
          <div>
            <Title style={{ color: "white" }}>Welcome to "Play Go Alive"!</Title>
            <Paragraph style={{ fontSize: 18, paddingBottom: 30, color: 'white' }}>
              Let me introduce a service that allows you to play live games
              and provide tips for using the service most effectively.
            </Paragraph>
          </div>
          <div>
            <Title style={{ color: "white" }}>Searching for an opponent!</Title>
            <Paragraph style={{ fontSize: 18, paddingBottom: 45, color: 'white' }}>
              Search on a map or in a list for a player who is close to you in
              rank and geolocation, so you can meet up with them.
            </Paragraph>
          </div>
          <div>
            <Title style={{ color: "white" }}>Start a conversation!</Title>
            <Paragraph style={{ fontSize: 18, paddingBottom: 45, color: 'white' }}>
              If you find such a player, simply click on their marker on
              the map and initiate a chat conversation.
            </Paragraph>
          </div>
          <div>
            <Title style={{ color: "white" }}>Create your own request!</Title>
            <Paragraph style={{ fontSize: 18, color: 'white' }}>
              If you don't find a player that meets your criteria, please add
              your own game request. Describe your skill level, specify if you
              have your own game set for a live game, and include any other
              important information.
            </Paragraph>
            <Paragraph style={{ fontSize: 18, paddingBottom: 45, color: 'white' }}>
              Then, simply wait for someone to contact you through the chat.
            </Paragraph>
          </div>
          <div>
            <Title style={{ color: "white" }}>Discuss the details!</Title>
            <Paragraph style={{ fontSize: 18, paddingBottom: 45, color: 'white' }}>
              In the chat, you can discuss the exact time and place of your live game.
            </Paragraph>
          </div>
          <div>
            <Title style={{ color: "white" }}>Let's get started!</Title>
            <Paragraph style={{ fontSize: 18, paddingBottom: 30, color: 'white' }}>
              I hope you'll be happy using "Play Go Alive"!
            </Paragraph>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center'}}>
              <Image preview={false} height={90} src="/images/go.png" />
            </div>
          </div>
        </Carousel>
      </Modal>
    </>
  );
};
