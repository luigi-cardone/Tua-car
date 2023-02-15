import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import {PlatformCard} from './platformCard';

function PlatformTabs(props) {

  return (
    <Tabs
      id="fill-tab-example"
      className="mb-3"
      fill
    >
    {props.platforms.map((platform, key) => {
      return(<Tab key={key} eventKey={platform.name} title={platform.name}>
        <PlatformCard checkPlatformHandler={props.checkPlatformHandler} regions={props.regions} assignedTowns={props.assignedTowns} platform={platform} taskDataHandler={props.taskDataHandler}/>
      </Tab>)
    })}
    </Tabs>
  );
}

export default PlatformTabs;