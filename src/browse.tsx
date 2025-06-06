import { ActionPanel, List } from '@raycast/api';
import { execSync } from 'child_process';
import { useState } from 'react';
import Domain from './domain';

execSync('defaults domains')
  .toString()
  .split(', ')
  .map((domain) => {
    return new Domain(domain);
  });

let isLoading = true;
export default function render() {
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(true);
  isLoading = false;

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      onSelectionChange={(id) => {
        if (id) {
          setIsLoadingDetail(true);
          new Domain(id).fetch().then(() => {
            setIsLoadingDetail(false);
          });
        }
      }}
    >
      {Object.values(Domain.index).map((domain) => {
        return (
          <List.Item
            id={domain.id}
            key={domain.id}
            title={domain.id}
            detail={
              <List.Item.Detail
                isLoading={isLoadingDetail}
                markdown={`\`\`\`json
${domain.settings}
\`\`\``}
              />
            }
            actions={<ActionPanel></ActionPanel>}
          />
        );
      })}
    </List>
  );
}
