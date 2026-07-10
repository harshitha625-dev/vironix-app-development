import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ProjectType } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  OtpVerification: { email: string; purpose: 'signup' | 'reset' };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ProjectDetail: { projectId: string };
};

export type CreateStackParamList = {
  CreateHome: undefined;
  AIVideoGeneration: undefined;
  ImageToVideo: undefined;
  ReferenceVideo: undefined;
  ManualEdit: { projectId?: string } | undefined;
  GenerationProgress: { projectId: string; type: ProjectType };
  ProjectDetail: { projectId: string };
};

export type ProjectsStackParamList = {
  ProjectsMain: undefined;
  ProjectDetail: { projectId: string };
};

export type DownloadsStackParamList = {
  DownloadsMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Wallet: undefined;
  Pricing: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ProjectsTab: NavigatorScreenParams<ProjectsStackParamList>;
  CreateTab: NavigatorScreenParams<CreateStackParamList>;
  DownloadsTab: NavigatorScreenParams<DownloadsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
