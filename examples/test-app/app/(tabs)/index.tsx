import { useRouter } from 'expo-router';

import { AppFrame } from '../../src/components';
import { useLabState } from '../../src/lab-state';
import { HomeScreen } from '../../src/screens/HomeScreen';

export default function HomeRoute() {
  const router = useRouter();
  const state = useLabState();

  return (
    <AppFrame>
      <HomeScreen
        cartCount={state.cartCount}
        isOnline={state.isOnline}
        isRefreshing={state.isRefreshing}
        lastSyncLabel={state.lastSyncLabel}
        modalVisible={state.modalVisible}
        noticeVisible={state.noticeVisible}
        onDismissNotice={state.dismissNotice}
        onHideModal={state.hideModal}
        onOpenCatalog={() => router.navigate('/catalog')}
        onOpenForm={() => router.navigate('/form')}
        onOpenSettings={() => router.navigate('/settings')}
        onRefresh={state.refreshMetrics}
        onSetOnline={state.setIsOnline}
        onShowModal={state.showModal}
      />
    </AppFrame>
  );
}
