import classNames from "classnames"
import { Box } from "@mui/material"
import { StepLayout } from "./StepLayout"
import { HubspotForm } from "./HubspotForm"

// HubspotForm is now a fully self-contained <form> (it handles its own
// submit + success/error state via the HubSpot Forms Submission API).
// We used to wrap it in another <form onSubmit={onClose}> here, which
// closed the entire tutorial modal as soon as the inner submit button
// bubbled - users never got to see the "Thanks - we'll be in touch!"
// confirmation. Just render HubspotForm directly inside the step layout.

export const DemoComponentForm = ({
  goBack,
  animate,
}: {
  goBack: () => void;
  onClose: () => void;
  animate: boolean;
}) => {
  return (
    <div
      className={classNames(
        'transition-all duration-300 transform',
        animate ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
      )}
    >
      <StepLayout goBack={goBack}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            width: '100%',
          }}
        >
          <HubspotForm />
        </Box>
      </StepLayout>
    </div>
  )
}
