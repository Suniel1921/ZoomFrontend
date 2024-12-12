import React from 'react';
import { Timeline } from 'antd';
import Item from 'antd/es/list/Item';

const TimeLine = () => {
  const onChange = (e: any) => {
    // console.log(e);
    console.log('time line data is', e)
  };

  return (
    <Timeline onChange={onChange}>
      <Item>Step 1: This is the first step.</Item>
      <Item>Step 2: This is the second step.</Item>
      <Item>Step 3: This is the third step.</Item>
      <Item>Step 4: This is the third step.</Item>
      <Item>Step 5: This is the third step.</Item>
      <Item>Step 6: This is the third step.</Item>
      <Item>Step 7: This is the third step.</Item>
      <Item>Step 8: This is the third step.</Item>
    </Timeline>
  );
};

export default TimeLine;
