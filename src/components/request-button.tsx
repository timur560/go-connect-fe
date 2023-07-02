import { Button, Popconfirm } from 'antd';
import { MIN_WIDTH } from 'data/constants';
import useWindowDimensions from 'hooks/use-window-dimentions';

type RequestButtonProps = {
  mode: 'create' | 'cancel';
  onCreate: () => void;
  onCancel: () => void;
};

export const RequestButton = (props: RequestButtonProps) => {
  const { width } = useWindowDimensions();

  return (
    <div
      className="request-button-container"
      style={{ bottom: width > MIN_WIDTH ? 10 : 60 }}
    >
      {props.mode === 'cancel' ? (
        <Popconfirm
          title="Cancel request"
          description="Are you sure to cancale your game request?"
          onConfirm={props.onCancel}
          // onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <Button
            danger
            type="primary"
            size={width > MIN_WIDTH ? 'large' : 'small'}
          >
            Cancel my game request
          </Button>
        </Popconfirm>
      ) : (
        <Button
          size={width > MIN_WIDTH ? 'large' : 'small'}
          type="primary"
          onClick={props.onCreate}
        >
          Place a live game request
        </Button>
      )}
    </div>
  );
};
