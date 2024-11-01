import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IconInfo } from '../../components/Icons/IconInfo';
import { Loading } from '../../components/Loading';
import { SubmitModal } from '../../components/modal/SubmitModal';
import { deleteMe, getExportMyData } from '../../http';
import { useAppStore } from '../../store/useAppStore';

export function ManageData() {
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState(false);
  const navigate = useNavigate();
  const doClearState = useAppStore((s) => s.doClearState);

  const onDownloadMyData = () => {
    setLoading(true);
    getExportMyData()
      .then((response) => {
        const binaryData = response.data;
        console.log(binaryData);
        const blob = new Blob([binaryData], { type: 'text/plain' });

        // Create a temporary URL for the Blob
        const url = URL.createObjectURL(blob);

        // Create a temporary link element
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mydata.json';

        // Append the link to the document, click it, and then remove it
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Release the URL once done
        URL.revokeObjectURL(url);
      })
      .catch(() => toast.error('Error'))
      .finally(() => setLoading(false));
  };

  const onDelete = () => {
    setLoading(true);
    deleteMe()
      .then(() => {
        toast.success('Success');
        doClearState();
        navigate('/');
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <div className="subtitle1 mb-8">Download your data</div>
      <div className="caption mb-8">
        You own your data. Tap the button below to download a copy of your data
      </div>
      <div className="manage-btn mb-8">
        <button className="gen-secondary-btn" onClick={onDownloadMyData}>
          Download My Data
        </button>
      </div>
      <div className="subtitle1 mb-8">Delete your data</div>
      <div className="caption mb-8">
        Use this only if you want to permanently delete your account & data from
        our system.
      </div>
      <div className="plate mb-8">
        <IconInfo />
        <p>
          Due to the immutable nature of distributed ledger technology, network
          nodes operated by the community may still retain historical
          transactions generated by your account, however your personally
          identifiable information such as your name, e-mail, your key-value
          storage etc will be removed. Any of your digital assets will be lost.
        </p>
      </div>
      <div className="manage-btn">
        <button
          className="gen-secondary-btn danger"
          onClick={() => setWarning(true)}
        >
          Delete My Data
        </button>
      </div>
      {warning && (
        <SubmitModal onClose={() => setWarning(false)}>
          <div className="title">Warning</div>
          <p className="text-center mb-32">
            {`Are you sure you want to delete your all data from the platform?`}
          </p>
          <div className="buttons">
            <button
              onClick={() => setWarning(false)}
              className="gen-secondary-btn medium"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete()}
              className="gen-primary-btn medium danger"
            >
              Submit
            </button>
          </div>
        </SubmitModal>
      )}
      {loading && <Loading />}
    </>
  );
}
