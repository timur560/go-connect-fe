import { PlusOutlined, QuestionCircleFilled } from '@ant-design/icons';
import {
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Upload,
  UploadFile,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { RcFile, UploadProps } from 'antd/es/upload';
import { RANK_OPTIONS } from 'data/rank-options';
import { degToDms } from 'helpers/helper';
import { useState } from 'react';
import { GameSetLabel } from 'types/game-request.type';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });


type RequestFormProps = {
  open?: boolean;
  onSubmit: (values: any) => void;
  onCancel?: () => void;
  position: { lat: number; lng: number };
};

export const RequestForm = ({
  open,
  onSubmit,
  onCancel = () => {},
  position,
}: RequestFormProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  return (
    <Modal
      title="Place a new live game request"
      open={open}
      footer={false}
      onCancel={onCancel}
      width={600}
    >
      <div>
        Game place coord: {degToDms(position.lat)}N {degToDms(position.lng)}E
      </div>
      <Divider />
      <Form
        labelCol={{ span: 8 }}
        onFinish={async (values) => {
          onSubmit({
            ...values,
            attachments: await Promise.all(fileList.map((f) => getBase64(f.originFileObj as RcFile))),
          })}
        }
        initialValues={
          localStorage.getItem('request')
            ? JSON.parse(`${localStorage.getItem('request')}`)
            : {}
        }
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input maxLength={50} />
        </Form.Item>
        <Form.Item
          label="Rank"
          name="rank"
          rules={[{ required: true, message: 'Rank is required' }]}
        >
          <Select options={RANK_OPTIONS.map((o) => ({ value: o, label: o }))} />
        </Form.Item>
        <Form.Item label="EGD ID" name="egdId" help="European Go Database ID">
          <InputNumber controls={false} min={0} />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            {
              pattern:
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
              message: 'Phone number is invalid',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Age" name="age">
          <InputNumber max={100} min={3} />
        </Form.Item>
        <Form.Item label="Gender" name="gender">
          <Select
            allowClear
            options={['Male', 'Female', 'Other'].map((o) => ({
              value: o,
              label: o,
            }))}
          />
        </Form.Item>
        <Form.Item label="Game Set" name="gameSet">
          <Select
            options={[
              { value: 0, label: GameSetLabel[0] },
              { value: 1, label: GameSetLabel[1] },
              { value: 2, label: GameSetLabel[2] },
            ]}
          />
        </Form.Item>
        <Row>
          <Col span={8} style={{ textAlign: 'right', paddingRight: 10 }}>
            Place description:
          </Col>
          <Col span={14}>
            <Form.Item
              label={false}
              name="description"
              rules={[
                {
                  required: false,
                  type: 'string',
                  min: 10,
                  message: 'Description must be at least 10 symbols',
                },
                {
                  required: false,
                  type: 'string',
                  max: 300,
                  message: 'Description must be less then 300 symbols',
                },
              ]}
            >
              <TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Tooltip title="Will it be outside or in some public place (cafe, restaurant, etc.)">
              <QuestionCircleFilled
                style={{ color: '#1677ff', paddingLeft: 10, cursor: 'help' }}
              />
            </Tooltip>
          </Col>
        </Row>
        <Row>
          <Col span={8} style={{ textAlign: 'right', paddingRight: 10 }}>
            Comment:
          </Col>
          <Col span={14}>
            <Form.Item
              label={false}
              name="comment"
              rules={[
                {
                  required: false,
                  type: 'string',
                  max: 300,
                  message: 'Comment must be less then 300 symbols',
                },
              ]}
            >
              <TextArea autoSize={{ minRows: 3, maxRows: 5 }} />
            </Form.Item>
          </Col>
          <Col span={2}>
            <Tooltip title="Any important informatin you wanna share">
              <QuestionCircleFilled
                style={{ color: '#1677ff', paddingLeft: 10, cursor: 'help' }}
              />
            </Tooltip>
          </Col>
        </Row>
        <Form.Item
          label="Images"
          help="Attach some photos of your game set, place, etc."
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            onChange={handleChange}
            beforeUpload={() => false}
            accept="image/*"
          >
            {fileList.length < 3 && <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>}
          </Upload>
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Space>
            <Button htmlType="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Modal>
  );
}
