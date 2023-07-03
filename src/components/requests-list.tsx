import { Avatar, Empty, List } from 'antd';
import moment from 'moment';
import { GameRequest, GameSet } from 'types/game-request.type';

type RequestsListProps = {
  items: { [key: string]: GameRequest };
  onClick: (id: string) => void;
  ownId: string | null;
};

export const RequestsList = (props: RequestsListProps) => {
  if (!Object.entries(props.items).length) {
    return (
      <Empty
        style={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
        description="No game requests"
      />
    );
  }

  return (
    <List
      size="small"
      style={{ flexGrow: 1 }}
      dataSource={Object.entries(props.items).sort((prev, next) => {
        if (moment(prev[1].createdAt).isBefore(moment(next[1].createdAt))) {
          return 1;
        }
        if (moment(prev[1].createdAt).isAfter(moment(next[1].createdAt))) {
          return -1;
        }
        return 0;
      })}
      renderItem={(item) => (
        <List.Item
          onClick={() => props.onClick(item[1].id)}
          className="left-side-list-item"
          style={
            props.ownId && props.ownId === item[1].id
              ? { backgroundColor: '#FFFBE6', fontWeight: 'bold' }
              : {}
          }
        >
          <List.Item.Meta
            avatar={
              <Avatar
                src={
                  item[0] === props.ownId
                    ? '/images/target.png'
                    : item[1].rank.includes('d')
                    ? '/images/pin.png'
                    : '/images/flag.png'
                }
                shape="square"
              />
            }
            title={`${item[1].name} [${item[1].rank}]`}
            description={`${
              item[1].gameSet === GameSet.STANDART
                ? 'Big game set'
                : item[1].gameSet === GameSet.SMALL
                ? 'Small game set'
                : 'No game set'
            }, ${moment.duration(moment(item[1].createdAt).diff(moment())).humanize(true)}`}
          />
          {/* {item[1].name} <Tag>{item[1].rank}</Tag>{' '}
          {item[1].gameSet === GameSet.STANDART && (
            <FontAwesomeIcon icon={faChessBoard} size="lg" />
          )}
          {item[1].gameSet === GameSet.SMALL && (
            <FontAwesomeIcon icon={faChessBoard} size="sm" />
          )} */}
        </List.Item>
      )}
    />
  );
};
