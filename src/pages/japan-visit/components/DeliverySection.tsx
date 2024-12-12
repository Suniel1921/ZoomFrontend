import Select from '../../../components/Select';
import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { JapanVisitFormData } from '../EditApplicationModal';

interface DeliverySectionProps {
  register: UseFormRegister<JapanVisitFormData>;
  watch: UseFormWatch<JapanVisitFormData>;
}

export default function DeliverySection({ register, watch }: DeliverySectionProps) {
  return null; // Component no longer needed
}