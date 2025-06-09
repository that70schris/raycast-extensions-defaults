import { Action, ActionPanel, Icon, List } from '@raycast/api';
import { useState } from 'react';
import Default, { Domains, Export } from './domain';

function Page({ page }: { page: Default }) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(true);
  page.fetch().then(() => {
    setIsLoading(false);
  });

  return (
    <List
      isLoading={isLoading}
      isShowingDetail
      onSelectionChange={(id) => {
        if (id) {
          setIsLoadingDetail(true);
          new Export(id).fetch().then(() => {
            setIsLoadingDetail(false);
          });
        }
      }}
    >
      {page.list.map((item) => {
        return (
          <List.Item
            id={item.id}
            key={item.id}
            title={item.id}
            detail={
              <List.Item.Detail
                isLoading={isLoadingDetail}
                markdown={item.detail}
              />
            }
            actions={
              <ActionPanel>
                <Action.Push
                  icon={Icon.ChevronRight}
                  title="Open"
                  target={<Page page={item} />}
                />
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}

export default function domains() {
  return <Page page={new Domains()} />;
}
