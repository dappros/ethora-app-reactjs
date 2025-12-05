import classNames from "classnames"
import { useForm, SubmitHandler } from "react-hook-form"
import { StepLayout } from "./StepLayout"
import CustomInput from "../../../../components/input/Input"
import { Box } from "@mui/material"
import CustomButton from "../../../../pages/AuthPage/Button"

type FormInputs = {
  name: string;
  email: string;
  phone?: string;
}

export const DemoComponentForm = ({
    goBack,
    animate,
    onClose,
  }: {
    goBack: () => void;
    onClose: () => void;
    animate: boolean;
  }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>()

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log('Form submitted:', data)
    onClose()
  }

  return (
    <div
      className={classNames(
        'transition-all duration-300 transform',
        animate ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
      )}
    >
      <StepLayout goBack={goBack}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            width: '100%',
          }}
        >
          <div className="mb-4">
            <p className="text-2xl font-bold">Book a Demo</p>
            <p className="text-sm text-gray-500 mt-1">Fill in your details to schedule a demo</p>
          </div>

          <CustomInput
            placeholder="Name"
            id="name"
            fullWidth
            {...register('name', { 
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters'
              }
            })}
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            required
          />

          <CustomInput
            placeholder="Email"
            id="email"
            type="email"
            fullWidth
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            required
          />

          <CustomInput
            placeholder="Phone (optional)"
            id="phone"
            type="tel"
            fullWidth
            {...register('phone')}
            error={Boolean(errors.phone)}
            helperText={errors.phone?.message}
          />

          <div className="mt-6 pt-4 border-t w-full flex items-center justify-center">
            <CustomButton type="submit" variant="contained">
              Book demo
            </CustomButton>
          </div>
        </Box>
      </StepLayout>  
    </div>
  )
}