const StepIndicator = ({
  current,
  total,
}: {
  current: number
  total: number
}) => (
  <p className='text-sm font-medium text-[#c9830c]'>
    Step {current} of {total}
  </p>
)

export default StepIndicator
