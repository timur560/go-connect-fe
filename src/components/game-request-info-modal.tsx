import { Button, Descriptions, Divider, Image, Modal, Space } from 'antd';
import { GameRequest, GameSetLabel } from 'types/game-request.type';

type GameRequestInfoModalProps = {
  request: GameRequest;
  open: boolean;
  onCancel?: () => void;
  onOpenChat?: () => void;
  isOwn: boolean;
};

export const GameRequestInfoModal = ({
  request,
  open,
  onCancel,
  onOpenChat,
  isOwn,
}: GameRequestInfoModalProps) => {
  return (
    <Modal
      title={`Game request by ${request.name}, ${request.rank}`}
      open={open}
      onCancel={onCancel}
      footer={
        isOwn ? (
          false
        ) : (
          <div>
            <Button type="primary" onClick={onOpenChat}>
              Open chat
            </Button>
          </div>
        )
      }
    >
      <Descriptions bordered size="small" layout="vertical">
        <Descriptions.Item label="Name">{request.name}</Descriptions.Item>
        <Descriptions.Item label="Rank">{request.rank}</Descriptions.Item>
        <Descriptions.Item label="EGD ID">
          {request.egdId ? (
            <a
              href={`https://www.europeangodatabase.eu/EGD/Player_Card.php?&key=${request.egdId}`}
              target="_blank"
              rel="noreferrer"
            >
              {request.egdId}
            </a>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {request.phone || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Age">{request.age || '-'}</Descriptions.Item>
        <Descriptions.Item label="Gender">
          {request.gender || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Game Set">
          {GameSetLabel[request.gameSet]}
        </Descriptions.Item>
        <Descriptions.Item label="Description">
          {request.description || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Comment">
          {request.comment || '-'}
        </Descriptions.Item>
      </Descriptions>

      {request?.attachments?.length ? <>
        <Divider />
        <Image.PreviewGroup>
          <Space size="large" wrap align="center">
            {request.attachments.map((src) => (
              <Image src={src} width={140} />
            ))}
          </Space>
        </Image.PreviewGroup>
      </> : null}
    </Modal>
  );
};
