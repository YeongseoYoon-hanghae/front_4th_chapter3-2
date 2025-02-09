import { VStack, FormControl, FormLabel, Select, HStack, Input } from '@chakra-ui/react';

import { FormState, RepeatType } from '../../types';

interface RepeatSettingProps {
  repeatType: RepeatType;
  repeatInterval: number;
  repeatEndDate: string;
  updateFormState: (state: Partial<FormState>) => void;
}
const RepeatSetting = ({
  repeatType,
  repeatInterval,
  repeatEndDate,
  updateFormState,
}: RepeatSettingProps) => {
  return (
    <VStack width="100%">
      <FormControl>
        <FormLabel>반복 유형</FormLabel>
        <Select
          value={repeatType}
          onChange={(e) => updateFormState({ repeatType: e.target.value as RepeatType })}
        >
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
          <option value="yearly">매년</option>
        </Select>
      </FormControl>
      <HStack width="100%">
        <FormControl>
          <FormLabel>반복 간격</FormLabel>
          <Input
            type="number"
            value={repeatInterval}
            onChange={(e) => updateFormState({ repeatInterval: Number(e.target.value) })}
            min={1}
          />
        </FormControl>
        <FormControl>
          <FormLabel>반복 종료일</FormLabel>
          <Input
            type="date"
            value={repeatEndDate}
            onChange={(e) => updateFormState({ repeatEndDate: e.target.value })}
          />
        </FormControl>
      </HStack>
    </VStack>
  );
};

export default RepeatSetting;
