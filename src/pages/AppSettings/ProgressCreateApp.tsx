import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  IconButton,
  Step,
  StepIconProps,
  StepLabel,
  Stepper,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  isAppearanceAdjusted: boolean;
  isEndUserCreated: boolean;
  onClose: () => void;
}

const CustomStepIcon = ({ completed, icon }: StepIconProps) => {
  const isCompleted = completed || icon === 1;
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      {isCompleted ? (
        <CheckCircleIcon sx={{ color: '#4caf50' }} />
      ) : (
        <CancelIcon sx={{ color: '#f44336' }} />
      )}
    </Box>
  );
};

const ProgressCreateApp = ({
  isAppearanceAdjusted,
  isEndUserCreated,
  onClose,
}: Props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation();

  const steps = [
    t('appSettingsProgressCreateApp.stepAppCreated'),
    t('appSettingsProgressCreateApp.stepAppearanceAdjusted'),
    t('appSettingsProgressCreateApp.stepEndUserCreated'),
  ];

  const activeStep = !isAppearanceAdjusted ? 1 : !isEndUserCreated ? 2 : 3;

  const handleNavigateTo = (tab: string) => {
    searchParams.set('tab', tab);
    navigate({ search: searchParams.toString() });
  };

  const handleClose = () => {
    if (activeStep === 3) {
      localStorage.setItem('isProgressCreateAppOpen', 'false');
    }
    onClose();
  };

  const renderHint = () => {
    if (activeStep === 1) {
      return (
        <Typography variant="body2" color="textSecondary">
          {t('appSettingsProgressCreateApp.hintOpenPrefix')}{' '}
          <Button variant="text" onClick={() => handleNavigateTo('Appearance')}>
            {t('appSettingsProgressCreateApp.appearanceTabButton')}
          </Button>{' '}
          {t('appSettingsProgressCreateApp.hintOpenSuffix')}
        </Typography>
      );
    }
    if (activeStep === 2) {
      return (
        <Typography variant="body2" color="textSecondary">
          {t('appSettingsProgressCreateApp.hintGoToPrefix')}{' '}
          <Button variant="text" onClick={() => handleNavigateTo('Web app')}>
            {t('appSettingsProgressCreateApp.webAppTabButton')}
          </Button>{' '}
          {t('appSettingsProgressCreateApp.hintGoToSuffix')}
        </Typography>
      );
    }

    return (
      <Typography variant="body2" color="textSecondary">
        {t('appSettingsProgressCreateApp.completedMessage')}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        p: isMobile ? 2 : '16px 42px',
        bgcolor: '#f9f9f9',
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <IconButton
        size="small"
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      <Stepper
        activeStep={activeStep}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        alternativeLabel={!isMobile}
      >
        {steps.map((label, index) => (
          <Step
            key={label}
            completed={
              index === 0 ||
              (index === 1 && isAppearanceAdjusted) ||
              (index === 2 && isEndUserCreated)
            }
          >
            <StepLabel StepIconComponent={CustomStepIcon}>
              {!isMobile && label}
            </StepLabel>
            {isMobile && (
              <Typography
                variant="caption"
                sx={{ pl: 4, mt: 0.5, mb: 1 }}
                color="textSecondary"
              >
                {label}
              </Typography>
            )}
          </Step>
        ))}
      </Stepper>

      <Box pt={2} textAlign="center">
        {renderHint()}
      </Box>
    </Box>
  );
};

export default ProgressCreateApp;
