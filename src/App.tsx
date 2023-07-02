import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Drawer, Layout, Space } from 'antd';
import { RequestForm } from 'components/request-form';
import {
  AimOutlined,
  MessageOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import './index.css';
import { RequestButton } from 'components/request-button';
import { RequestsList } from 'components/requests-list';
import { GameRequest } from 'types/game-request.type';
import { GameRequestInfoModal } from 'components/game-request-info-modal';
import { ChatItem, ChatPanel } from 'components/chat-panel';
import { ChatMessage } from 'components/chat';
import { IntroModal } from 'components/intro-modal';
import useWindowDimensions from 'hooks/use-window-dimentions';
import { TabBar } from 'antd-mobile';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { CONTAINER_STYLE, CONTAINER_STYLE_MOBILE, MESSAGE_SOUND, MIN_WIDTH, NEW_REQUEST_SOUND } from 'data/constants';

const App = () => {
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [isRequestModalOpen, setRequestModalOpen] = useState<boolean>(false);
  const [isPointerVisible, setPointerVisible] = useState<boolean>(false);
  const [center, setCenter] = useState({
    lat: 49.488157,
    lng: 8.458419,
  });
  const [position, setPosition] = useState({
    lat: 49.488157,
    lng: 8.458419,
  });

  // const [wsClient, setWsClient] = useState<WebSocket | null>(null);

  const wsClient = useRef<WebSocket | null>(null);

  const [wsId, setWsId] = useState<string | null>(null);

  const [selectedRequest, setSelectedRequest] = useState<GameRequest | null>(
    null
  );
  const [gameRequestInfoPopupVisible, setGameRequestInfoPopupVisible] =
    useState<boolean>(false);

  const [requests, setRequests] = useState<{ [key: string]: GameRequest }>({});

  const [activeChats, setActiveChats] = useState<ChatItem[]>([]);

  const [chatMessages, setChatMessages] = useState<{
    [key: string]: ChatMessage[];
  }>({});

  const [chatPanelOpen, setChatPanelOpen] = useState<boolean>(false);
  const [requestsListPanelOpen, setRequestsListPanelOpen] =
    useState<boolean>(false);
  // const chatMessagesRef = useRef(chatMessages);

  const [activeChatId, setActiveChatId] = useState<string>('');
  const { width } = useWindowDimensions();

  const [currentTab, setCurrentTab] = useState<string>('map');

  useEffect(() => {
    if (localStorage.getItem('request')) {
      const request = JSON.parse(`${localStorage.getItem('request')}`);
      setCenter({
        lat: request.lat,
        lng: request.lng,
      });
    } else if (navigator) {
      navigator.geolocation?.getCurrentPosition(
        ({ coords }) => {
          setCenter({
            lat: coords.latitude,
            lng: coords.longitude,
          });
        },
        () => {
          // not a problem
        }
      );
    }
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission();
    } else {
      console.log('Browser does not support notifications');
    }
  }, []);

  useEffect(() => {
    wsClient.current = new WebSocket(`${process.env.REACT_APP_WS_SERVER_URL}`);

    return () => {
      wsClient.current?.close();
    };
  }, []);

  useEffect(() => {
    if (wsClient.current) {
      wsClient.current.onmessage = (event: any) => {
        var message = JSON.parse(event.data);
        switch (message.type) {
          case 'setId':
            setWsId(message.id);
            localStorage.setItem('wsId', message.id);
            // TODO: use localstorage ws id to restore requets
            break;
          case 'requestsList':
            if (
              Object.entries(message.requests)?.length >
              Object.entries(requests)?.length
            ) {
              try {
                NEW_REQUEST_SOUND.play();
              } catch (e) {
                ///
              }
            }
            setRequests(message.requests);
            break;
          case 'chatMessage':
            const chatMessage = {
              fromName: message.senderName,
              toName: localStorage.getItem('name'),
              fromId: message.senderId,
              toId: wsId,
              text: message.text,
              dateTime: new Date(),
            };
            try {
              MESSAGE_SOUND.play();
              new Notification(`${message.senderName}: "${message.text}"`);
            } catch (e) {
              ///
            }

            if (chatMessages[message.senderId]) {
              setChatMessages({
                ...chatMessages,
                [message.senderId]: [
                  ...chatMessages[message.senderId],
                  chatMessage,
                ],
              });
            } else {
              setActiveChats([
                ...activeChats,
                { id: message.senderId, name: message.senderName },
              ]);
              setChatMessages({
                ...chatMessages,
                [message.senderId]: [chatMessage],
              });
            }
            setChatPanelOpen(true);
            setCurrentTab('chat');
            setActiveChatId(message.senderId);

            break;
        }
      };
    }
  }, [activeChats, chatMessages, requests, wsId]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyCzTWjG9uJG4KiA3ZcmWuPH5K7tvZnNYls',
  });

  const onUnmount = useCallback(function callback(map: any) {
    setMap(null);
  }, []);

  const onLoad = useCallback(function callback(map: any) {
    setMap(map);
  }, []);

  useEffect(() => {
    setZoomLevel(12);
  }, [isLoaded]);

  const handleCreateRequestButtonPressed = () => {
    setPointerVisible(true);
    setChatPanelOpen(false);
    setRequestsListPanelOpen(false);
  };

  const cancelRequest = () => {
    setPointerVisible(false);
    wsClient.current?.send(JSON.stringify({ type: 'cancelRequest' }));
  };

  const handleSendChatMessage = (wsMessage: any) => {
    const chatMessage = {
      fromName: localStorage.getItem('name'),
      toName: wsMessage.senderName,
      fromId: wsId,
      toId: wsMessage.senderId,
      text: wsMessage.text,
      dateTime: new Date(),
    };

    console.log(chatMessages);

    if (chatMessages[wsMessage.recipientId]) {
      setChatMessages({
        ...chatMessages,
        [wsMessage.recipientId]: [
          ...chatMessages[wsMessage.recipientId],
          chatMessage,
        ],
      });
    } else {
      setChatMessages({
        ...chatMessages,
        [wsMessage.recipientId]: [chatMessage],
      });
    }
  };

  const handleCloseChat = (id: string) => {
    // remove messages
    const newChatMessages = { ...chatMessages };
    delete newChatMessages[id];
    setChatMessages(newChatMessages);

    // remove from chats
    setActiveChats(activeChats.filter((ch) => ch.id !== id));
  };

  const handleSubmitRequest = (values: any) => {
    // TODO: add a type
    if (wsClient.current) {
      const request = {
        id: wsId,
        ...values,
        lat: position.lat,
        lng: position.lng,
      };
      wsClient.current?.send(
        JSON.stringify({
          type: 'createRequest',
          request,
        })
      );
      localStorage.setItem('request', JSON.stringify(request));
      localStorage.setItem('name', values.name);
    }
    setRequestModalOpen(false);
    setPointerVisible(false);
  };

  const renderChatPanel = () => (
    <>
      {wsId && wsClient.current && 
        <ChatPanel
          activeKey={activeChatId}
          onChange={(activeKey) => setActiveChatId(activeKey)}
          ownId={wsId}
          items={activeChats}
          ws={wsClient.current}
          messages={chatMessages}
          onSend={handleSendChatMessage}
          onCloseChat={handleCloseChat}
        />
      }
    </>
  );

  const renderMap = () => (
    <>
      <GoogleMap
        mapContainerStyle={{
          ...(width <= MIN_WIDTH ? CONTAINER_STYLE_MOBILE : CONTAINER_STYLE),
          display: (width <= MIN_WIDTH && currentTab !== 'map') ? 'none' : 'block',
        }}
        center={center}
        zoom={zoomLevel}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onCenterChanged={() => {
          if (map) {
            setPosition({
              lat: (map as any).center.lat(),
              lng: (map as any).center.lng(),
            });
          }
        }}
        options={{
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {Object.entries(requests).map((request) => (
          <MarkerF
            icon={{
              url:
                request[0] === wsId
                  ? '/images/target.png'
                  : request[1].rank.includes('d')
                  ? '/images/pin.png'
                  : '/images/flag.png',
              scaledSize: { height: 32, equals: () => true, width: 32 },
            }}
            key={request[0]}
            position={{ lat: request[1].lat, lng: request[1].lng }}
            onClick={() => {
              setSelectedRequest(request[1]);
              setGameRequestInfoPopupVisible(true);
              setRequestsListPanelOpen(false);
              setChatPanelOpen(false);
              setCurrentTab('chat');
            }}
            label={{
              text: `${request[1].name} [${request[1].rank}]`,
              className: 'marker-label',
            }}
          />
        ))}
      </GoogleMap>
      {isPointerVisible && (
        <div className="picker">
          <p style={{ textAlign: 'center' }}>
            Choose location for the game
            <br />
            or your current location
          </p>
          <AimOutlined style={{ fontSize: 30, marginBottom: 10 }} />
          <Space>
            <Button
              type="default"
              onClick={() => {
                setRequestModalOpen(false);
                setPointerVisible(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setRequestModalOpen(true);
              }}
            >
              Confirm
            </Button>
          </Space>
        </div>
      )}
    </>
  );

  const renderRequestsList = () => (
    <div className="requests-list-container">
      <RequestsList
        items={requests}
        onClick={(id) => {
          if (id && requests[id]) {
            setCenter({
              lat: requests[id].lat,
              lng: requests[id].lng,
            });
          }
          setChatPanelOpen(false);
          setRequestsListPanelOpen(false);
          setCurrentTab('map');
        }}
        ownId={wsId}
      />
    </div>
  );

  const tabs = [
    {
      key: 'list',
      title: 'Requests',
      icon: <UnorderedListOutlined />,
    },
    {
      key: 'map',
      title: 'Map',
      icon: <FontAwesomeIcon icon={faMap} />,
    },
    {
      key: 'chat',
      title: 'Chat',
      icon: <MessageOutlined />,
    },
  ];

  return (
    <div className="App">
      {width > MIN_WIDTH ?
        <Layout>
          {!chatPanelOpen && (
            <Button
              icon={<MessageOutlined />}
              size="large"
              className="border-button--right"
              onClick={() => setChatPanelOpen(true)}
            />
          )}
          {!requestsListPanelOpen && (
            <Button
              icon={<UnorderedListOutlined />}
              size="large"
              className="border-button--left"
              onClick={() => setRequestsListPanelOpen(true)}
            />
          )}
          <Drawer
            placement="left"
            open={requestsListPanelOpen}
            mask={false}
            width={350}
            onClose={() => setRequestsListPanelOpen(false)}
            bodyStyle={{ padding: 0, margin: 0 }}
          >
            {renderRequestsList()}
          </Drawer>
          <Layout.Content style={{ position: 'relative' }}>
            {isLoaded && renderMap()}
          </Layout.Content>
          <Drawer
            placement="right"
            open={chatPanelOpen}
            mask={false}
            width={350}
            onClose={() => setChatPanelOpen(false)}
            bodyStyle={{ padding: 10, margin: 0 }}
          >
            {renderChatPanel()}
          </Drawer>
        </Layout>
        :
        <Layout>
          <div className="mobile-container">
            {currentTab === 'list' && renderRequestsList()}
            {isLoaded && renderMap()}
            {currentTab === 'chat' && <div style={{padding: 10, height: '100svh'}}>{renderChatPanel()}</div>}
          </div>
          <TabBar activeKey={currentTab} onChange={(key) => {
            setCurrentTab(key);
          }}>
            {tabs.map(item => (
              <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
            ))}
          </TabBar>
        </Layout>
      }
      {!isRequestModalOpen && (width > MIN_WIDTH || currentTab === 'map') && (
        <RequestButton
          mode={wsId && requests[wsId] ? 'cancel' : 'create'}
          onCreate={handleCreateRequestButtonPressed}
          onCancel={cancelRequest}
        />
      )}
      <RequestForm
        open={isRequestModalOpen}
        onSubmit={handleSubmitRequest}
        onCancel={() => {
          setRequestModalOpen(false);
          setPointerVisible(false);
        }}
        position={position}
      />
      {selectedRequest && (
        <GameRequestInfoModal
          isOwn={selectedRequest.id === wsId}
          open={gameRequestInfoPopupVisible}
          request={selectedRequest}
          onCancel={() => setGameRequestInfoPopupVisible(false)}
          onOpenChat={() => {
            if (!activeChats.find((ac) => ac.id === selectedRequest.id)) {
              setActiveChats([
                ...activeChats,
                { id: selectedRequest.id, name: selectedRequest.name },
              ]);
            }
            setGameRequestInfoPopupVisible(false);
            setChatPanelOpen(true);
            setCurrentTab('chat');
            setActiveChatId(selectedRequest.id);
          }}
        />
      )}
      <IntroModal />
    </div>
  );
};

// const root = createRoot(document.getElementById("root"));
// root.render(<App />);

export default App;
