import { Toast } from '@/components/toast';
import { SuccessToast } from '@/features/shared/components/error-toast';

type ShowToastProps = {
  title: string;
  description: string;
  type: 'success' | 'error' | 'info';
};

export const useToast = () => {
  const showToast = ({ description, title, type }: ShowToastProps) => {
    Toast.show(<SuccessToast title={title} description={description} />, {
      type: type,
      duration: 5000,
      position: 'top',
      action: undefined,
    });
  };

  return { showToast };
};
